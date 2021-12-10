# Online Tuition website

>## This is an online tuition website that provide platform that allow user to buy online course and learn online

### Technology involve in this project
* EJS template
* Node js
* Express js
* Firebase
* Mongodb/ Mongoose
* Stripe __(Handle Payment)__
* HTML, CSS, Javascript
* dotenv

### How to setup the for the website in your local computer
1. Download the code from https://github.com/chan1992241/Tuition-Website.git
2. run command "npm install" to install require dependencies
3. Import data to your mongodb, each collection name is following the title of the file
4. Create a .env file that contain your stripe API key **(optional)**
    SERVER_URL=http://localhost:3000
    STRIPE_API_KEY=your_stripe_api_key
5. Run command node index.js and go to localhost:3000

Future Improvement
--------
1. Change more secure way to add course to each user
2. Bug fix
3. Clean up redundant css property.