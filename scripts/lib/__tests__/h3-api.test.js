import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock fetch 拦截所有网络调用
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// env.js 的 loadDotenvInto 需要 fs 存在,但测试注入 key 即可
process.env.LLM_API_KEY = 'sk-test-llm'
process.env.MINIMAX_H3_API_KEY = 'sk-test-h3'

// 重新加载模块(import 缓存清理)
vi.resetModules()
const client = await import('../h3-api/client.js')
const video = await import('../h3-api/video.js')
const image = await import('../h3-api/image.js')
const speech = await import('../h3-api/speech.js')

describe('client.js', () => {
  it('getApiKey 读 LLM_API_KEY', () => {
    expect(client.getApiKey()).toBe('sk-test-llm')
  })
  it('getH3ApiKey 读 MINIMAX_H3_API_KEY', () => {
    expect(client.getH3ApiKey()).toBe('sk-test-h3')
  })
  it('callApi useH3Key 发 H3 key 到 Authorization', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: 1 }), { status: 200 }))
    await client.callApi('https://x', '/path', { useH3Key: true })
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('https://x/path')
    expect(opts.headers.Authorization).toBe('Bearer sk-test-h3')
  })
  it('callApi 默认发 LLM key', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: 1 }), { status: 200 }))
    await client.callApi('https://x', '/path', {})
    const [, opts] = mockFetch.mock.calls[1]
    expect(opts.headers.Authorization).toBe('Bearer sk-test-llm')
  })
  it('callApi 非 2xx 抛错带 status', async () => {
    mockFetch.mockResolvedValueOnce(new Response('{"error":"bad"}', { status: 400 }))
    await expect(client.callApi('https://x', '/path', { retries: 0 })).rejects.toThrow(/HTTP 400/)
  })
})

describe('video.js', () => {
  beforeEach(() => mockFetch.mockClear())

  it('createVideo 组装 t2va 请求体并返回 task_id', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 't1' }), { status: 200 }))
    const id = await video.createVideo({
      content: [{ type: 'text', text: 'hello' }],
      resolution: '768P', duration: 5, ratio: '9:16',
    })
    expect(id).toBe('t1')
    const [, opts] = mockFetch.mock.calls[0]
    const body = JSON.parse(opts.body)
    expect(body.model).toBe('MiniMax-H3')
    expect(body.content).toEqual([{ type: 'text', text: 'hello' }])
    expect(body.resolution).toBe('768P')
    expect(body.duration).toBe(5)
    expect(body.ratio).toBe('9:16')
    // H3 key
    expect(opts.headers.Authorization).toBe('Bearer sk-test-h3')
  })

  it('waitForVideo 轮询到 succeeded 返回 task', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ task: { status: 'queued' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ task: { status: 'succeeded', content: { url: 'u' }, usage: {} } }), { status: 200 }))
    const task = await video.waitForVideo('t1', { pollInterval: 1 })
    expect(task.status).toBe('succeeded')
  })

  it('waitForVideo 失败时抛错带 task 信息', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ task: { status: 'failed', error: { message: '敏感' } } }), { status: 200 }))
    await expect(video.waitForVideo('t1', { pollInterval: 1 })).rejects.toThrow(/敏感/)
  })

  it('createContextIr 返回 task_id', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 'ct1' }), { status: 200 }))
    const id = await video.createContextIr({ content: [{ type: 'text', text: 'x' }], duration: 5, ratio: '9:16' })
    expect(id).toBe('ct1')
    const [, opts] = mockFetch.mock.calls[0]
    expect(JSON.parse(opts.body).model).toBe('MiniMax-H3')
  })

  it('createVideo 非法 duration 抛错', async () => {
    await expect(video.createVideo({ content: [{ type: 'text', text: 'x' }], duration: 20 })).rejects.toThrow(/4-15/)
    await expect(video.createVideo({ content: [{ type: 'text', text: 'x' }] })).rejects.toThrow(/4-15/)
    await expect(video.createVideo({ content: [{ type: 'text', text: 'x' }], duration: 5.5 })).rejects.toThrow(/4-15/)
  })

  it('createContextIr 非法 duration 抛错', async () => {
    await expect(video.createContextIr({ content: [{ type: 'text', text: 'x' }], duration: 3 })).rejects.toThrow(/4-15/)
  })

  it('createVideo t2va 缺 ratio 抛错', async () => {
    await expect(video.createVideo({ content: [{ type: 'text', text: 'x' }], duration: 5 })).rejects.toThrow(/ratio/)
  })

  it('createVideo t2va 用 adaptive ratio 抛错', async () => {
    await expect(video.createVideo({ content: [{ type: 'text', text: 'x' }], duration: 5, ratio: 'adaptive' })).rejects.toThrow(/adaptive/)
  })

  it('createVideo i2va 带图可不传 ratio', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 't2' }), { status: 200 }))
    const id = await video.createVideo({
      content: [{ type: 'text', text: 'x' }, { type: 'image_url', image_url: { url: 'mm_file://a' }, role: 'first_frame' }],
      duration: 5,
    })
    expect(id).toBe('t2')
  })

  it('downloadVideo 自动创建目录', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new ArrayBuffer(4), { status: 200 }))
    const path = '/tmp/h3test/deep/nested/v.mp4'
    await video.downloadVideo('https://x/v.mp4', path)
    const fs = await import('node:fs')
    expect(fs.existsSync(path)).toBe(true)
    fs.unlinkSync(path)
    fs.rmdirSync('/tmp/h3test/deep/nested')
    fs.rmdirSync('/tmp/h3test/deep')
    fs.rmdirSync('/tmp/h3test')
  })

  it('probeVideo 解析 ffprobe JSON 并估算帧数', async () => {
    vi.resetModules()
    vi.doMock('node:child_process', () => ({
      execSync: () => JSON.stringify({
        format: { duration: '5.17' },
        streams: [
          { codec_type: 'video', width: 768, height: 1344, r_frame_rate: '24/1', nb_frames: '124' },
          { codec_type: 'audio' },
        ],
      }),
    }))
    const v2 = await import('../h3-api/video.js')
    const probe = await v2.probeVideo('/tmp/x.mp4')
    expect(probe.frames).toBe(124)
    expect(probe.hasAudio).toBe(true)
    expect(probe.fps).toBe(24)
    vi.doUnmock('node:child_process')
  })

  it('probeVideo 帧数缺失时用时长估算', async () => {
    vi.resetModules()
    vi.doMock('node:child_process', () => ({
      execSync: () => JSON.stringify({
        format: { duration: '10.0' },
        streams: [
          { codec_type: 'video', width: 768, height: 1344, r_frame_rate: '24/1' },
        ],
      }),
    }))
    const v2 = await import('../h3-api/video.js')
    const probe = await v2.probeVideo('/tmp/y.mp4')
    expect(probe.frames).toBeNull()
    expect(probe.framesEst).toBe(240)
    vi.doUnmock('node:child_process')
  })

  it('createRegeneration 组装 base_video content', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 'r1' }), { status: 200 }))
    const id = await video.createRegeneration({
      content: [
        { type: 'text', text: 'prompt' },
        { type: 'video_url', video_url: { url: 'mm_file://x' }, role: 'base_video' },
      ],
    })
    expect(id).toBe('r1')
    const [, opts] = mockFetch.mock.calls[0]
    const body = JSON.parse(opts.body)
    expect(body.resolution).toBe('2K')
    expect(body.content[1].role).toBe('base_video')
  })

  it('listVideos 带 query 参数', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 }))
    await video.listVideos({ pageNum: 1, pageSize: 20, filter: { task_type: 'generation' } })
    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/v2/query/video_generation?')
    expect(url).toContain('page_num=1')
    expect(url).toContain('page_size=20')
  })
})

describe('image.js', () => {
  beforeEach(() => mockFetch.mockClear())

  it('generateImage 组装 t2i 请求并返回 urls', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      data: { image_urls: ['https://x/1.png'] }, metadata: { success_count: 1 },
      base_resp: { status_code: 0 },
    }), { status: 200 }))
    const r = await image.generateImage({ prompt: 'cat', n: 1 })
    expect(r.imageUrls).toEqual(['https://x/1.png'])
    const [, opts] = mockFetch.mock.calls[0]
    const body = JSON.parse(opts.body)
    expect(body.model).toBe('image-01')
    expect(body.aspect_ratio).toBe('9:16')
    // 通用 key
    expect(opts.headers.Authorization).toBe('Bearer sk-test-llm')
  })

  it('generateImage 失败抛错', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ base_resp: { status_code: 1026, status_msg: '敏感' } }), { status: 200 }))
    await expect(image.generateImage({ prompt: 'x' })).rejects.toThrow(/敏感/)
  })
})

describe('speech.js', () => {
  beforeEach(() => mockFetch.mockClear())

  it('synthesize 组装 voice_setting 带 emotion', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      data: { audio: 'a', subtitle_file: 's' }, extra_info: { usage_characters: 10 },
      base_resp: { status_code: 0 },
    }), { status: 200 }))
    const r = await speech.synthesize({ text: '测试', emotion: 'angry', voice: 'v1' })
    expect(r.usageCharacters).toBe(10)
    const [, opts] = mockFetch.mock.calls[0]
    const body = JSON.parse(opts.body)
    expect(body.model).toBe('speech-2.8-hd')
    expect(body.voice_setting.voice_id).toBe('v1')
    expect(body.voice_setting.emotion).toBe('angry')
  })

  it('synthesize 默认 output url', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      data: { audio: 'u' }, base_resp: { status_code: 0 },
    }), { status: 200 }))
    await speech.synthesize({ text: 'x' })
    const [, opts] = mockFetch.mock.calls[0]
    expect(JSON.parse(opts.body).output_format).toBe('url')
  })
})
