// Generate QR code on form submit
document.getElementById('qrForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    fetch('http://127.0.0.1:5000/generate_qr', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the entire response

            if (data.qr_code) {
                document.getElementById('qrCode').style.display = 'block';
                document.getElementById('qrCode').src = 'data:image/png;base64,' + data.qr_code;
                localStorage.setItem('secret', data.secret);
            } else {
                alert("Error generating QR code");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to generate QR code');
        });
});

// Validate TOTP on form submit
document.getElementById('validateForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const secret = localStorage.getItem('secret');

    if (!secret) {
        alert("No secret found. Please generate a QR code first.");
        return;
    }

    formData.append('secret', secret);

    fetch('http://127.0.0.1:5000/validate_totp', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            if (data.valid) {
                resultDiv.innerHTML = '<span class="valid">✔ Valid TOTP</span>';
            } else {
                resultDiv.innerHTML = '<span class="invalid">✘ Invalid TOTP</span>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to validate TOTP');
        });
});
