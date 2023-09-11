import express from "express";
import axios from "axios";

const PAYPAL_API_URL = "https://api-m.sandbox.paypal.com";
// Live mode :  const PAYPAL_API_URL = "https://api-m.paypal.com";

const router = express.Router();

//  An endpoint that handle canceled subscription and failed payments

router.get("/webhook", async (req, res) => {
    const { body, method, headers } = req;
    /* Start verifying PayPal signature*/
    // Validate the PayPal signature headers
    const transmissionId = headers["paypal-transmission-id"];
    const transmissionTime = headers["paypal-transmission-time"];
    const transmissionSig = headers["paypal-transmission-sig"];
    const certUrl = headers["paypal-cert-url"];
    const webhookEvent = body;

    //Get access token

    const { data } = await axios.post(
        `${PAYPAL_API_URL}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
        }
    );

    console.log(data.access_token);

    const { data: verificationData } = await axios.post(
        `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
        {
            transmission_id: transmissionId,
            transmission_time: transmissionTime,
            cert_url: certUrl,
            auth_algo: "SHA256withRSA",
            transmission_sig: transmissionSig,
            webhook_id: process.env.WEBHOOK_ID,
            webhook_event: webhookEvent,
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.access_token}`,
            },
        }
    );

    console.log({ verificationData });

    //End verifying the signature

    if (verificationData.verification_status === "SUCCESS") {
        if (method === "POST") {
            // Handle  cancelled subscription.
            if (webhookEvent.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
                const subscriptionId = webhookEvent.resource.id;
                console.log({ subscriptionId });
                //use the subscription id to retrieve the customer who canceled the subscription from the db
                console.log({ webhookEvent });
                return res.status(200).send("done");
            }

            // Handle failed Payments.
            if (
                webhookEvent.event_type ===
                "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
            ) {
                const subscriptionId = webhookEvent.resource.id;
                // const subscriptionId =
                //use the subscription id to retrieve the customer who paid the subscription from the db

                return res.status(200).send("done");
            }

            console.log("Unsupported event", webhookEvent);
        } else {
            // Return a 404 error for non-POST requests
            res.status(404).send("Not Found");
        }
    } else {
        return res.status(500).send("Signature verification failed");
    }
});

//  An endpoint that returns information about the subscription plan
router.get("/subscriptionInfo", async (req, res) => {
    const response = await axios.post(
        `${PAYPAL_API_URL}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
        }
    );
    const accessToken = response.data.access_token;
    //send subscription id as query parameter
    const subscriptionId = req.query.subscriptionId;
    const susbscriptionResponse = await axios.get(
        `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return res.status(200).send(susbscriptionResponse.data);
});

//  An endpoint to cancel subscription

router.post("/cancelSubscription", async (req, res) => {
    const response = await axios.post(
        `${PAYPAL_API_URL}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
        }
    );
    const accessToken = response.data.access_token;
    //send subscription id as query parameter
    const subscriptionId = req.query.subscriptionId;
    const cancelSubscriptionResponse = await axios.post(
        `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return res.status(200).send(cancelSubscriptionResponse.data);
});

export default router;
