import io
import base64
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask
from flask import current_app

def generate_challan_qr(challan_id: str, return_format="base64") -> str:
    """
    Generates a high-quality QR code pointing strictly to the public status page.
    Does NOT contain sensitive administrative data inside the QR.
    Only contains the public verification URL.
    """
    base_url = current_app.config.get("PUBLIC_PORTAL_URL", "http://localhost:5173/public/challan")
    target_url = f"{base_url.rstrip('/')}/{challan_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    # Clean professional traffic blue/slate tint for subtle aesthetic
    img = qr.make_image(
        fill_color="#1E3A8A", # Deep navy/traffic blue
        back_color="#FFFFFF"
    )

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    if return_format == "bytes":
        return buf.getvalue(), target_url

    # Default: base64 data URI
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}", target_url
