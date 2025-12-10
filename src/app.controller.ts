import { Controller, Get, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from './guards/public.decorator';
import { ApiResponse } from './utils/common/apiresponse/apiresponse';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('/')
  @ApiOperation({
    summary: 'Server says: ‘I got you, boss!’ 😁🟢 Please you check me',
    description:
      'This is the official test route for the OutManzizi API. If you’re seeing this, congrats — the server is alive, the code’s behaving, and your day just got better! 😎🎉',
  })
  @Public()
  getMainPage(@Req() req: Request, @Res() res: Response) {
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('text/html')) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OutManzizi API Server</title>
    <style> 
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height:100vh; display:flex; align-items:center; justify-content:center; color:white; }
        .container { text-align:center; padding:2rem; background: rgba(255,255,255,0.1); backdrop-filter:blur(10px); border-radius:20px; border:1px solid rgba(255,255,255,0.2); box-shadow:0 8px 32px rgba(0,0,0,0.1); max-width:800px; width:90%; }
        .logo { font-size:4rem; margin-bottom:1rem; background:linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3); background-size:400% 400%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:gradient 3s ease infinite; }
        @keyframes gradient { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
        h1 { font-size:3rem; margin-bottom:1rem; font-weight:700; text-shadow:2px 2px 4px rgba(0,0,0,0.3); }
        .subtitle { font-size:1.2rem; margin-bottom:2rem; opacity:0.9; font-weight:300; }
        .status-card { background: rgba(255,255,255,0.15); padding:1.5rem; border-radius:15px; margin:1.5rem 0; border:1px solid rgba(255,255,255,0.1); }
        .status-item { display:flex; justify-content:space-between; align-items:center; margin:0.8rem 0; font-size:1.1rem; }
        .status-value { font-weight:600; color:#4ecdc4; }
        .api-links { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:2rem; }
        .api-link { background:linear-gradient(45deg,#4ecdc4,#44a08d); color:white; text-decoration:none; padding:0.8rem 1.5rem; border-radius:25px; font-weight:600; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(0,0,0,0.2); }
        .api-link:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.3); text-decoration:none; color:white; }
        @media (max-width:768px) { h1{font-size:2rem;} .logo{font-size:3rem;} .container{padding:1.5rem;} .api-links{flex-direction:column;} }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1>Welcome to OutManAzizi API Server</h1>
        <p class="subtitle">Your one-stop solution for all things marketplace.</p>
        <div class="status-card">
            <div class="status-item"><span>Status:</span><span class="status-value">✅ Online</span></div>
            <div class="status-item"><span>Version:</span><span class="status-value">v1.0.0</span></div>
            <div class="status-item"><span>Database:</span><span class="status-value">✅ Connected</span></div>
            <div class="status-item"><span>Environment:</span><span class="status-value">Development</span></div>
        </div>
        <div class="api-links">
            <a href="/api" class="api-link">📚 Go to API Documentation</a>
        </div>
    </div>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlContent);
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(
          '🧩 Test route working fine — which means... nothing’s broken yet! 😂 OutManAzizi API is happy and so should you be, dev! 🎉',
        ),
      );
  }
}
