import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './guards/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getMainPage(@Res() res: Response) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OutManzizi API Server</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            width: 90%;
        }

        .logo {
            font-size: 4rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient 3s ease infinite;
        }

        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            font-weight: 300;
        }

        .status-card {
            background: rgba(255, 255, 255, 0.15);
            padding: 1.5rem;
            border-radius: 15px;
            margin: 1.5rem 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.8rem 0;
            font-size: 1.1rem;
        }

        .status-value {
            font-weight: 600;
            color: #4ecdc4;
        }

        .api-links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
        }

        .api-link {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            text-decoration: none;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .api-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            text-decoration: none;
            color: white;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .feature-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .feature-desc {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            .logo { font-size: 3rem; }
            .container { padding: 1.5rem; }
            .api-links { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1>Welcome to OutManzizi API Server</h1>
        <p class="subtitle">Your one-stop solution for all things marketplace.</p>
        
        <div class="status-card">
            <div class="status-item">
                <span>Status:</span>
                <span class="status-value">✅ Online</span>
            </div>
            <div class="status-item">
                <span>Version:</span>
                <span class="status-value">v1.0.0</span>
            </div>
            <div class="status-item">
                <span>Database:</span>
                <span class="status-value">✅ Connected</span>
            </div>
            <div class="status-item">
                <span>Environment:</span>
                <span class="status-value">Development</span>
            </div>
        </div>

        

        <div class="api-links">
            <a href="/api" class="api-link">📚 Go to API Documentation</a>
        </div>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }
}