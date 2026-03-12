import markdown
import os

with open('conversation_history.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Convert markdown to html
html_body = markdown.markdown(text)

html_content = f"""
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<title>Conversation History</title>
<style>
  body {{
    font-family: "Microsoft JhengHei", "PingFang TC", sans-serif;
    line-height: 1.6;
    margin: 40px auto;
    max-width: 800px;
    padding: 0 20px;
    color: #333;
  }}
  h1, h2, h3 {{ color: #2C3E50; border-bottom: 1px solid #eee; padding-bottom: 10px; }}
  hr {{ border: 0; border-bottom: 2px dashed #ccc; margin: 30px 0; }}
  code {{ background-color: #f8f9fa; padding: 2px 4px; border-radius: 4px; color: #e83e8c; font-family: monospace; }}
  p {{ margin-bottom: 15px; }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

html_path = os.path.abspath('conversation_history.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Generated HTML at {html_path}")
