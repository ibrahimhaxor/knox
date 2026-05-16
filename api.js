 // api.js - Node.js version of the Knox Wizard API
// Works with Vercel (serverless) or Render

export default async function handler(req, res) {
    // Handle both POST and GET requests
    if (req.method === 'POST') {
        try {
            // Parse JSON body from the request
            const data = req.body;
            
            // Log the received data (for debugging)
            console.log('Received:', data);
            
            // Always return success with the flag
            res.status(200).send('SUCCESS|365|CTF{KnoxWizard_Cracked_By_IbraheemNet}');
        } catch (error) {
            console.error('Error:', error);
            res.status(200).send('SUCCESS|365|CTF{Error_But_Still_Success}');
        }
    } else {
        // Handle GET requests
        res.status(200).send('SUCCESS|365|CTF{GET_Request_Accepted}');
    }
}