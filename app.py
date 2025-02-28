# from flask import Flask, render_template, jsonify, request
# import firebase_admin
# from firebase_admin import credentials, db
# from flask import jsonify, send_file
# import qrcode
# from io import BytesIO
# from datetime import datetime
# import pytz
# import os
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText
# from email.mime.base import MIMEBase
# from email import encoders
# import smtplib

# app = Flask(__name__)

# # Initialize Firebase Admin SDK
# cred = credentials.Certificate('csps-98ea1-firebase-adminsdk-o7nx9-65e1ea2664.json')
# firebase_admin.initialize_app(cred, {
#     'databaseURL': 'https://csps-98ea1-default-rtdb.firebaseio.com/'
# })

# # Route to render index page
# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/signin')
# def signin():
#     return render_template('signin.html')

# @app.route('/signup')
# def signup():
#     return render_template('signup.html')

# # Route to get all parking locations
# @app.route('/locations', methods=['GET'])
# def get_locations():
#     ref = db.reference('parking_locations')
#     locations = ref.get()
#     print(locations)
#     return jsonify(locations)

# # @app.route('/get/<location_id>', methods=['GET'])
# # def get_avail(location_id):
# #     ref = db.reference(f'parking_locations/{location_id}')
# #     avail = ref.get()
# #     print(locations)
# #     return jsonify(locations)

# # Route to book a parking spot
# @app.route('/book/<location_id>', methods=['POST'])
# def book_spot(location_id):
#     ref = db.reference(f'parking_locations/{location_id}')
#     parking_data = ref.get()

#     if parking_data and parking_data['available_spots'] > 0:
#         # Decrease available spots by 1 and add booking time
#         ist_timezone = pytz.timezone("Asia/Kolkata")
#         booking_time_ist = datetime.now(ist_timezone).strftime('%Y-%m-%d %H:%M:%S')  # Store UTC time in ISO format
#         ref.update({
#             'available_spots': parking_data['available_spots'] - 1,
#             'booking_time': booking_time_ist  # Store the booking time
#         })

#         # Generate QR code with parking spot details and booking time
#         qr_text = f"Parking Spot: {parking_data['name']}\nBooking Time: {booking_time_ist}"
#         qr = qrcode.make(qr_text)
#         file_name = f"booking_qr_{location_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
#         file_path = os.path.join('qr_codes', file_name)

#         # Ensure the directory exists
#         os.makedirs(os.path.dirname(file_path), exist_ok=True)

#         # Save QR code locally
#         qr.save(file_path)
        
#         email='rudrakshagarwal03@gmail.com'
#         # number=st.text_input("Enter Contact no."," ")
#         # st.success("File Saved Successfully!")
#         sender_email = "agarwalrudrakshrdx2003@gmail.com"
#         receiver_email = email
#         subject = "Parking Booking"
#         body = qr_text
#         qr_path = file_path

#         # Create the email message
#         msg = MIMEMultipart()
#         msg['From'] = sender_email
#         msg['To'] = receiver_email
#         msg['Subject'] = subject

#         # Attach the body text
#         msg.attach(MIMEText(body, 'plain'))

#         # Attach the PDF file
#         with open(qr_path, "rb") as attachment:
#             pdf_part = MIMEBase("application", "octet-stream")
#             pdf_part.set_payload(attachment.read())
#             encoders.encode_base64(pdf_part)  # Encode to base64
#             pdf_part.add_header(
#                 "Content-Disposition",
#                 f"attachment; filename= {qr_path}",
#             )
#             msg.attach(pdf_part)

#         # Send the email
#         try:
#             with smtplib.SMTP("smtp.gmail.com", 587) as server:
#                 server.starttls()  # Secure the connection
#                 server.login(sender_email, "npvn qlcn frhc xvlg")  # Log in to the server
#                 server.send_message(msg)  # Send the email

#         except Exception as e:
#             print(f"Failed to send email: {e}")


#         # Send the QR code image as a file response
#         return jsonify({"status": "success", "message": "Booking confirmed!"})
#     else:
#         return jsonify({"status": "fail", "message": "Hudi BABA, Booking Ho Giya"})




# if __name__ == '__main__':
#     app.run(debug=True, port=5001)


from flask import Flask, render_template, jsonify, request, redirect, session
import firebase_admin
from firebase_admin import credentials, db, auth  # Import auth for Firebase Authentication
import qrcode
from datetime import datetime
import pytz
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from PIL import Image, ImageDraw, ImageFont
import smtplib

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set a secret key for sessions

# Initialize Firebase Admin SDK
cred = credentials.Certificate('csps-98ea1-firebase-adminsdk-o7nx9-65e1ea2664.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://csps-98ea1-default-rtdb.firebaseio.com/'
})

file=''
qrt=''

# Route to render index page
@app.route('/')
def index():
    # Check if the user is logged in
    if 'user_id' not in session:
        return redirect('/signin')
    return render_template('index.html')

@app.route('/signin')
def signin():
    return render_template('signin.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

# Login route to authenticate user
@app.route('/login', methods=['POST'])
def login():
    print("LOGIN____")
    # Retrieve user credentials from the request
    email = request.form.get('email')
    password = request.form.get('password')
    print(email)
    # Firebase Authentication
    try:
        user = auth.get_user_by_email(email)
        # Implement password verification based on your Firebase setup (e.g., using Firebase Authentication API)
        # This example assumes successful authentication for simplicity
        
        # If authentication is successful, store user in session
        session['user_id'] = user.uid  # Use the Firebase UID as a unique identifier
        session['name'] = email.split('@')[0]
        print(session['name'])
        
        return redirect('/')
    except Exception as e:
        print(f"Authentication error: {e}")
        return redirect('/signin')

# Logout route to clear session
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('name', None)
    return redirect('/signin')

# Route to get all parking locations
@app.route('/locations', methods=['GET'])
def get_locations():
    if 'user_id' not in session:
        return redirect('/signin')
    ref = db.reference('parking_locations')
    locations = ref.get()
    return jsonify(locations)

# Route to book a parking spot
@app.route('/book/<location_id>', methods=['POST'])
def book_spot(location_id):
    if 'user_id' not in session:
        return jsonify({"status": "fail", "message": "User not signed in!"}), 401
    
    ref = db.reference(f'parking_locations/{location_id}')
    parking_data = ref.get()

    if parking_data and parking_data['available_spots'] > 0:
        # Decrease available spots by 1 and add booking time
        ist_timezone = pytz.timezone("Asia/Kolkata")
        booking_time_ist = datetime.now(ist_timezone).strftime('%Y-%m-%d %H:%M:%S')
        ref.update({
            'available_spots': parking_data['available_spots'] - 1,
            'booking_time': booking_time_ist
        })

        # Generate QR code with parking spot details and booking time
        # qr_text = f"Parking Spot: {parking_data['name']}\nBooking Time: {booking_time_ist}"
        
        qr_text= {
                "Parking Spot": parking_data["name"],
                "Booking Time": booking_time_ist
                 }


        qr = qrcode.make(qr_text)
        file_name = f"booking_qr_{location_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        file_path = os.path.join('qr_codes', file_name)

        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Save QR code locally
        qr.save(file_path)

        return jsonify({
            "status": "success",
            "message": "Booking confirmed!",
            "qr_text": qr_text,
            "file_path": file_path
        })
    else:
        return jsonify({"status": "fail", "message": "No available spots!"}), 400

    

@app.route('/mail', methods=['GET'])
def mail():
    if 'user_id' not in session:
        return jsonify({"status": "fail", "message": "User not signed in!"}), 401

    qr_text = request.args.get('qrText')
    file_path = request.args.get('filePath')

    if not qr_text or not file_path:
        return jsonify({"status": "fail", "message": "Invalid mail details!"}), 400

    email = 'rudrakshagarwal03@gmail.com'
    sender_email = "agarwalrudrakshrdx2003@gmail.com"
    receiver_email = email
    subject = "Parking Booking Confirmation"
    body = qr_text

    # Create the email message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # Attach the QR code image
    try:
        with open(file_path, "rb") as attachment:
            qr_part = MIMEBase("application", "octet-stream")
            qr_part.set_payload(attachment.read())
            encoders.encode_base64(qr_part)
            qr_part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
            msg.attach(qr_part)

        # Send the email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, "npvn qlcn frhc xvlg")  # Use app-specific password for security
            server.send_message(msg)

        return jsonify({"status": "success", "message": "Mail sent successfully!"})
    except Exception as e:
        print(f"Failed to send email: {e}")
        return jsonify({"status": "fail", "message": "Failed to send mail!"}), 500
    
@app.route('/bill', methods=['POST'])
def receive_data():
    try:
        # Get data from the query parameters
        # data = request.get_json()
        print("---------------------------")
        
        parking_spot = request.args.get('parkingSpot')
        booking_time = request.args.get('bookingTime')
        current_time = request.args.get('currentTime')
        time_difference = request.args.get('timeDifference')
        cost = request.args.get('cost')

        # If any parameter is missing, return an error
        # if not all([parking_spot, booking_time, current_time, time_difference, cost]):
        #     return jsonify({'error': 'Missing data'}), 400
        
        # receive_data = {
        #     'billing details': {
        #         'parkingSpot': parking_spot,
        #         'bookingTime': booking_time,
        #         'currentTime': current_time,
        #         'timeDifference': time_difference,
        #         'cost': cost
        #     }
        # }
        
        receive_data = {
    "billing details": {
        "parkingSpot": parking_spot,
        "bookingTime": booking_time,
        "currentTime": current_time,
        "timeDifference": time_difference,
        "cost": cost
    }
}
        data=receive_data
        
        width, height = 600, 400
        image = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(image)

        # Fonts (adjust path as needed for your system)
        try:
            font = ImageFont.truetype("arial.ttf", size=24)
            font_bold = ImageFont.truetype("arialbd.ttf", size=28)
        except IOError:
            font = ImageFont.load_default()
            font_bold = ImageFont.load_default()

        # Header
        draw.text((width // 2 - 100, 20), "Parking Billing Details", fill="black", font=font_bold)

        # Draw details
        details = [
            f"Parking Spot: {data['billing details']['parkingSpot']}",
            f"Booking Time: {data['billing details']['bookingTime']}",
            f"Current Time: {data['billing details']['currentTime']}",
            f"Duration (minutes): {data['billing details']['timeDifference']}",
            f"Total Cost: ₹{data['billing details']['cost']}"
        ]

        y_offset = 80
        for detail in details:
            draw.text((50, y_offset), detail, fill="black", font=font)
            y_offset += 50

        # Save or display the image
        image.save("billing_details.png")
        image.show()


        
        print(receive_data)
        email = 'rudrakshagarwal03@gmail.com'
        sender_email = "agarwalrudrakshrdx2003@gmail.com"
        receiver_email = email
        subject = "Parking Booking Bill"
        body = str(receive_data)

        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        path="billing_details.png"
        # Attach the QR code image
        try:
            with open(path, "rb") as attachment:
                _part = MIMEBase("application", "octet-stream")
                _part.set_payload(attachment.read())
                encoders.encode_base64(_part)
                _part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(path)}")
                msg.attach(_part)
            # Send the email
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(sender_email, "npvn qlcn frhc xvlg")  # Use app-specific password for security
                server.send_message(msg)

            return jsonify({"status": "success", "message": "Mail sent successfully!"})
        except Exception as e:
            print(f"Failed to send email: {e}")
            return jsonify({"status": "fail", "message": e})

        # You can process the data (save it, perform calculations, etc.)
        response = {
            'status': 'success',
            'message': 'Data received successfully',
            'received_data': {
                'parkingSpot': parking_spot,
                'bookingTime': booking_time,
                'currentTime': current_time,
                'timeDifference': time_difference,
                'cost': cost
            }
        }
        print(response)
        print(receive_data)

        return jsonify("response")  # Return valid JSON response

    except Exception as e:
        print(e)
        return {'error': str(e)}


if __name__ == '__main__':
    app.run(debug=True, port=5005)
