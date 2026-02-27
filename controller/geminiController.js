require('dotenv').config()
const { GoogleGenAI } = require("@google/genai");
const { raiseTokenForFaultDevice } = require('./deviceController');

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const companyInfo = `
Introduction:
BeaconTrack is your smart solution for asset security and peace of mind. We offer compact, high-performance tracking devices that help individuals and businesses monitor their valuable assets in real time—right from our intuitive web platform.
Whether you're safeguarding equipment, vehicles, or personal belongings, BeaconTrack ensures you're always in control. Our sleek devices are easy to deploy and built for reliability.
To make your experience seamless, BeaconTrack features an integrated AI-powered chatbot that provides instant support, answers your questions, and guides you through setup. 

Whenever the user greets you, respond asking for their email address. When user is provided with an email you can note it down.
For other general questions, respond normally. And it might be anything apart from company info.

Details:
Located at Calicut, near KSRTC Bus stand. Visit us at BeaconTrack, Calicut. We're open Monday to Friday from 9:00 AM to 4:00 PM.

For inquiries, feel free to reach out via email at track@beacon.com or call us at +91 9895 123456.

Our wbsite, https://beacontrack.com, offers a seamless tracking experience for customers.

About Tracking Device:
This is a battery powered electronics tracking device. People can track their assets.
Device location and device paramters such as battery health, signal strength all can be monitored.

Service:
Get the below informations from user to register a deivce service. If customer want to raise a ticket to register a device service
get device serial number as a string pre-text with id: then followed by serial number. This is very important.

Important:
- get email address from user. If the user is provided with other query, ask email with your responce and repeat until you get it.
- Respond to general user queries too.
- If you don't have any answer, direct user to ask any thing related to the information provided above.

Using details provided above, please address this query.
`

// pre-history
let history = [
    {
        role: "model",
        parts: [
            {
                text: companyInfo,
            }
        ],
    },
    // {
    //     role: "user",
    //     parts: [
    //         {
    //             text : "Hello"
    //         }
    //     ],
    // },
]

function extractSpecificEmail(text) {
    const targetDomain = "@gmail.com";

    // 1. Initialize the flag and the variable
    let extractedEmail = null;
    let emailFoundFlag = false;

    // 2. Use includes() to check if the target domain exists
    if (text.includes(targetDomain)) {
        // The flag is set immediately because the known string was found
        emailFoundFlag = true;

        // 3. Find the starting position of the target string
        const domainStartIndex = text.indexOf(targetDomain);

        // 4. Determine the START of the email: Scan backwards from the domain start 
        //    until a space or the beginning of the string is found.
        let emailStartIndex = domainStartIndex;
        while (emailStartIndex > 0 && text[emailStartIndex - 1] !== ' ') {
            emailStartIndex--;
        }

        // 5. Extract the email from its determined start index to the end of the domain.
        //    We add the length of the domain to domainStartIndex to get the correct end index.
        const domainEndIndex = domainStartIndex + targetDomain.length;
        extractedEmail = text.substring(emailStartIndex, domainEndIndex);
    }

    // 6. Return the extracted value and the flag
    return {
        email: extractedEmail,
        flag: emailFoundFlag
    };
}

const extractSerialNo = (text) => {
    const deviceSerialNo = "id:"
    let extractedSerialNumber = null;
    let idFoundFlag = false;

    if (text.includes(deviceSerialNo)) {
        idFoundFlag = true
        const data = text.split(" ")

        // 1. Find the index of the string "id:"
        const idLabelIndex = data.indexOf("id:");

        // 2. Check if "id:" was found AND if there is an element after it.
        if (idLabelIndex !== -1 && idLabelIndex < data.length - 1) {
            // 3. The ID number is at the index immediately following "id:"
            extractedSerialNumber = data[idLabelIndex + 1];
        }
    }

    return {
        serialNo: extractedSerialNumber,
        flag: idFoundFlag
    }
}

let emailFound = true
let serialNumberFound = true
let emailId = null
let serialNumber = null

const aiChatBot = async (req, res) => {

    const prompt = req.body //req.query.prompt || "Hello";

    console.log("req body with prompt", prompt)

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Combine history + latest user message
    let contents = [
        ...history,
        { role: "user", parts: [{ text: prompt.contents }] },
        // ...prompt.contents,
    ];

    try {
        // Call the streaming API
        const stream = await ai.models.generateContentStream({
            // const chat = ai.chats.create({
            model: "gemini-2.5-flash",  // or whichever model name is valid
            contents,

            // you may optionally pass generationConfig etc
        });

        let replay = ""
        // The stream is an async iterable
        for await (const chunk of stream) {
            // Each chunk might have .text or candidate properties
            const text = chunk.text ?? "";  // adapt to your SDK's chunk shape
            if (text) {
                res.write(`${JSON.stringify({ text })}\n\n`);
                replay += text
            }
        }
        res.end();

        // Update conversation history
        history = [
            ...contents,
            { role: "model", parts: [{ text: replay }] },
        ];


        if (emailFound) {
            const { email, flag } = extractSpecificEmail(prompt.contents)
            console.log('email:', email);
            emailId = email
            emailFound = !flag
        }

        if (serialNumberFound) {
            const { serialNo, flag } = extractSerialNo(prompt.contents)
            console.log('serialNo:', serialNo);
            serialNumberFound = !flag
            serialNumber = serialNo

            history = [
                ...contents,
                { 
                    role: "model", parts: [{ 
                    text: "Ask device serial number for registering a service request." 
                    }] 
                },
            ];
        }

        if (!emailFound && !serialNumberFound) {
            // api call
            const username = await raiseTokenForFaultDevice(emailId, serialNumber)
            console.log(username);
            
            // Update conversation history
            history = [
                ...contents,
                { 
                    role: "model", parts: [{ 
                    text: `We have got both email and device serial number. So, tell the user service request is raised. And greet them with user name ${username}` 
                    }] 
                },
            ];
        }
        // api call

        // console.log(history);
        // res.status(200).json({chatHistory: history})

    } catch (err) {
        console.error("Streaming error:", err);
        res.write(`event: error\ndata: ${err.message}\n\n`);
        res.end();
    }

}

module.exports = aiChatBot