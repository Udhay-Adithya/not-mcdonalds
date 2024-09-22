from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pyotp
import qrcode
from io import BytesIO
import base64

app = Flask(__name__)
CORS(app)

# Generate QR code based on username and email
@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    try:
        username = request.form['username']
        email = request.form['email']
        print(f"Username: {username}, Email: {email}")

        secret = pyotp.random_base32()  # Generate a random secret
        print(f"Secret: {secret}")  
        totp = pyotp.TOTP(secret)  # No need to specify digest, SHA1 is default

        # Generate the TOTP URL and create the QR code
        otp_url = totp.provisioning_uri(name=username, issuer_name="McDonalds")
        print(f"OTP URL: {otp_url}")  
        qr = qrcode.make(otp_url)
        buffered = BytesIO()
        qr.save(buffered)
        qr_data = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({'qr_code': qr_data, 'secret': secret})

    except Exception as e:
        print(f"Error: {e}")  
        return jsonify({'error': str(e)}), 500



# Validate the TOTP code
@app.route('/validate_totp', methods=['POST'])
def validate_totp():
    try:
        user_totp = request.form['totp']
        secret = request.form['secret']

        totp = pyotp.TOTP(secret, digest=None)
        is_valid = totp.verify(user_totp)

        return jsonify({'valid': is_valid})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
