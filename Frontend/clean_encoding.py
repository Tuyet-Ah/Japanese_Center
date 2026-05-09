from pathlib import Path

html_files = ['Home.html', 'courses.html', 'materials.html', 'profile.html', 'cart.html', 'login.html', 'register.html']

for name in html_files:
    path = Path(name)
    try:
        for enc in ['utf-8', 'latin-1', 'cp1252']:
            try:
                text = path.read_text(encoding=enc)
                path.write_text(text, encoding='utf-8')
                print(f"Cleaned {name} with {enc}")
                break
            except:
                continue
    except Exception as e:
        print(f"Error with {name}: {e}")

css = Path('styles.css')
text = css.read_text(encoding='utf-8')
text = text.replace('font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;', 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;')
css.write_text(text, encoding='utf-8')
print("Updated font stack")
print("Done!")
