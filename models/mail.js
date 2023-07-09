const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  const msg = {
    to: email, // Change to your recipient
    from: "andziullo@gmail.com", // Change to your verified sender
    subject: "Welcome to MyWebsite!",
    text: `Click the link below to verify your email: 
    http://localhost:3000/api/users/verify/${verificationToken}`,
    html: `<div>Click the link below to verify your email: <br> <a href="http://localhost:3000/api/users/verify/${verificationToken}">${process.env.APP_URL}/users/verify/${verificationToken}</a></p>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch(error => {
      console.error(error);
    });
};

module.exports = { sendVerificationEmail };
