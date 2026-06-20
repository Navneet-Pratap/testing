# Portfolio — Python Automation Engineer

This is a static, interactive portfolio scaffold. Edit the JSON files in `data/` to populate the site and then deploy the `portfolio/` folder to any static host.

Quick steps

1. Edit `data/profile.json` and `data/projects.json` with your information.
2. Serve locally to preview (Python's simple HTTP server):

```powershell
python -m http.server 5500 --directory "d:/work/business/portfolio"
# then open http://127.0.0.1:5500
```

3. Deploy the `portfolio/` folder to GitHub Pages, Netlify, Vercel (static), or any static host.

Features

- Interactive hero with subtle mouse-follow visual.
- Hoverable skill cards with lift animation.
- Project cards flip on hover and open modal on click for details.
- Live project filtering.

If you'd like, I can add a small `package.json` and a lightweight build step (Vite) to enable nicer dev server features. Otherwise the folder is ready for deployment.
