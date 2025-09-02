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
