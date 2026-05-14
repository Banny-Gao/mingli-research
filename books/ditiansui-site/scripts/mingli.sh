#!/bin/bash
# 《滴天髓》学习进度管理脚本
# 用法: mingli <command> [chapter]
# 示例: mingli list / mingli read tiandao / mingli skill bage

BASE="/root/.hermes/mingli/di-tian-sui"

case "$1" in
  list)
    echo "=== 《滴天髓》学习进度 ==="
    cat "$BASE/meta/index.md"
    ;;
  index)
    cat "$BASE/meta/index.md"
    ;;
  read)
    if [ -z "$2" ]; then
      echo "用法: mingli read <章节名>"
      echo "已完成的章节: tiandao, kundao, rendao, zhiming, liqi, peihe, tiangan, dizhi, bage"
    elif [ -f "$BASE/interpretations/$2/tutorial.md" ]; then
      cat "$BASE/interpretations/$2/tutorial.md"
    else
      echo "⚠️ 未找到章节: $2"
      echo "已完成的章节: tiandao, kundao, rendao, zhiming, liqi, peihe, tiangan, dizhi, bage"
    fi
    ;;
  skill)
    if [ -z "$2" ]; then
      echo "用法: mingli skill <章节名>"
      echo "已完成的章节: tiandao, kundao, rendao, zhiming, liqi, peihe, tiangan, dizhi, bage"
    elif [ -f "$BASE/skills/$2/SKILL.md" ]; then
      cat "$BASE/skills/$2/SKILL.md"
    else
      echo "⚠️ 未找到章节: $2"
      echo "已完成的章节: tiandao, kundao, rendao, zhiming, liqi, peihe, tiangan, dizhi, bage"
    fi
    ;;
  raw)
    if [ -z "$2" ]; then
      echo "用法: mingli raw <章节名>"
    elif [ -f "$BASE/raw/$2.md" ]; then
      cat "$BASE/raw/$2.md"
    else
      echo "⚠️ 未找到章节: $2"
    fi
    ;;
  help|*)
    echo "《滴天髓阐微》学习管理系统"
    echo ""
    echo "用法: mingli <command> [章节名]"
    echo ""
    echo "命令:"
    echo "  list              查看学习进度总览"
    echo "  index             同上"
    echo "  read <章节>        查看某章节的详细解读教程"
    echo "  skill <章节>       查看某章节的技能速查文件"
    echo "  raw <章节>         查看某章节的原始提取内容"
    echo "  help              显示帮助"
    echo ""
    echo "已完成的章节: tiandao(天道), kundao(坤道), rendao(人道), zhiming(知命), liqi(理气), peihe(配合), tiangan(天干), dizhi(地支), bage(八格)"
    ;;
esac