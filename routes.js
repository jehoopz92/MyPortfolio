const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const request = require('request');

var Recaptcha = require('express-recaptcha').Recaptcha;
//or with options
var options = { 'theme': 'dark' };
var recaptcha = new Recaptcha('6Ldtn38UAAAAACHR-mwP51ojzA9sjmmk4kw8kZMD', '6Ldtn38UAAAAAE-o3H-47Vr_Gv5ZoCY5Q2wA1kac', options);

router.get('/', (req, res) => {
    res.render('index', { success: req.session.success, errors: req.session.errors });
    req.session.errors = null;
});

router.get('/gallery', (req, res) => {
    res.render('gallery');
});

router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/fail', (req, res) => {
    res.render('fail');
});

router.post('/send', recaptcha.middleware.verify, (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let message = req.body.message;
    let captcha = req.recaptcha.error;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('message', 'Please leave me a message').notEmpty();



    let errors = req.validationErrors();

    if (req.body['g-recaptcha-response'] === undefined ||
        req.body['g-recaptcha-response'] === '' ||
        req.body['g-recaptcha-response'] === null) {
        req.session.errors = [{
            location: 'body',
            param: 'captcha',
            msg: 'Please select the captcha',
            value: ''
        }]
        req.session.success = false;
        res.redirect('/');
        return;
    }
    if (errors) {
        req.session.errors = errors;
        console.log(errors);
        req.session.success = false;
        res.redirect('/');
        return;
    }

    req.session.success = true;

    let response = req.body['g-recaptcha-response'];
    // secret key
    const secretKey = '6Ldtn38UAAAAAE-o3H-47Vr_Gv5ZoCY5Q2wA1kac';
    //verify url
    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${response}&remoteip=${req.connection.remoteAddress}`;

    //make request to url
    request(verifyUrl, (err, response, body) => {
        body = JSON.parse(body);
    })

    const output = `
     <img src="cid:unique@kreata.ee" alt="Snow" style="width:100%;">
     <p>You have a new contact request</p>
     <h1>Contact Details</h1>
     <ul>  
     <li>Name: ${req.body.name}</li>
     <li>Email: ${req.body.email}</li>
   </ul>
   <h1>Message</h1>
   <p>${req.body.message}</p>

     `;


    //create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'mail.emerywd.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'post@emerywd.com', // generated ethereal user
            pass: 'gWt6P(*r!G.N'  // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    //setup email data with unicode symbols
    let mailOptions = {
        from: '"Portfolio Contact" <post@emerywd.com>', // sender address
        to: 'jehoopz92@gmail.com', // list of receivers
        subject: 'Contact Request', // Subject line
        html: output,
        attachments: [{
            filename: 'image.jpg',
            path: 'public/images/mountains.jpeg',
            cid: 'unique@kreata.ee' //same cid value as in the html img src
        }]

    };

    //send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', { msg: 'Email has been sent' });
    });
});

module.exports = router;

// if (!req.recaptcha.error) {
//     console.log(req.body['g-recaptcha-response']);
// } else {
//     console.log('fail');
// }