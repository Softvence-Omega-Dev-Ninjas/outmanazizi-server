export function contactSellerTemplate({
  sellerName,
  buyerName,
  buyerEmail,
  buyerPhone,
  message,
  productTitle,
}: {
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  message: string;
  productTitle: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2>📩 New Inquiry for Your Listing</h2>
      <p>Hi <strong>${sellerName}</strong>,</p>
      
      <p><strong>${buyerName}</strong> is interested in your product:</p>
      <h3 style="color: #b38b59;">Product: ${productTitle}</h3>

      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #ddd; margin: 10px 0; padding-left: 10px;">
        ${message}
      </blockquote>

      <p><strong>Buyer’s Contact Details:</strong></p>
      <ul>
        <li>Email: <a href="mailto:${buyerEmail}">${buyerEmail}</a></li>
        ${buyerPhone ? `<li>Phone: ${buyerPhone}</li>` : ''}
      </ul>

      <p style="margin-top: 20px;">Please respond to the buyer as soon as possible.</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This email was automatically sent from Alvaaro. Please do not reply to this email.</p>
    </div>
  `;
}



export function otpEmailTemplate({

  otp,
}: {
  otp: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding: 40px;">
    
    <div style="
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      ">
      
      <!-- Logo -->
      <div style="text-align:center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/120x40?text=Your+Logo" 
             alt="Logo" 
             style="max-width:140px; opacity:0.9;">
      </div>

      <h2 style="text-align:center; color:#111; margin-top:0; font-size:24px;">
        🔐 Verify Your Account
      </h2>

      <p style="font-size:15px; line-height:1.6; color:#444;">
        Use the following One-Time Password (OTP) to verify your email address:
      </p>

      <div style="text-align:center; margin:28px 0;">
        <span style="
          display:inline-block;
          background:#4F46E5;
          color:#fff;
          padding:14px 40px;
          border-radius:10px;
          font-size:32px;
          font-weight:bold;
          letter-spacing:6px;
          box-shadow:0 3px 10px rgba(79,70,229,0.3);
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size:15px; line-height:1.7; color:#555; text-align:center;">
        This OTP is valid for <strong>10 minutes</strong>.<br/>
        Please do not share this code with anyone for security reasons.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">

      <p style="font-size:12px; color:#777; text-align:center; line-height:1.6;">
        This email was automatically generated.  
        If you didn’t request this, you can safely ignore it.
      </p>

    </div>

    <!-- Footer -->
    <p style="text-align:center; margin-top:25px; font-size:12px; color:#888;">
      © ${new Date().getFullYear()} m3alem.group. All rights reserved.
    </p>

  </div>
`;

}
