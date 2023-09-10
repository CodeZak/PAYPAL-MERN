import { PayPalButtons } from "@paypal/react-paypal-js";

//Business P-6VX47591MN020740DMT6HXLI

//Pro P-7E009139D99522152MT6HW7Y

//Starter P-5NV59792LL232842FMT6HWKA
// retrieve plan ids from paypal after creating subscription plans
const custom_id = "id"; // optional;
const plan1id = "P-5NV59792LL232842FMT6HWKA";
const plan2id = "P-7E009139D99522152MT6HW7Y";
const plan3id = "P-6VX47591MN020740DMT6HXLI";

const subscriptions = [
    {
        plan: "Starter",
        createSubscription: async (data, actions) => {
            const response = await actions.subscription.create({
                plan_id: plan1id,
                custom_id,
            });
            //response => subscription Id
            return response;
        },
    },
    {
        plan: "Pro",
        createSubscription: async (data, actions) => {
            const response = await actions.subscription.create({
                plan_id: plan2id,
                custom_id,
            });
            return response;
        },
    },
    {
        plan: "Business",
        createSubscription: async (data, actions) => {
            const response = await actions.subscription.create({
                plan_id: plan3id,
                custom_id: custom_id,
            });
            return response;
        },
    },
];

export const Paypal = () => {
    async function onApprove(data, actions) {
        console.log("subscription created");
        const orderId = data.orderID;
        const subscriptionId = data.subscriptionID;
        console.log({ orderId, subscriptionId });
        // Update the subscription status in your database
    }
    return (
        <div className="App">
            <div>
                {subscriptions.map((item, index) => {
                    return (
                        <div key={index}>
                            <div>{item.plan}</div>
                            <PayPalButtons
                                createSubscription={item.createSubscription}
                                onApprove={onApprove}
                                style={{
                                    label: "subscribe",
                                }}
                            ></PayPalButtons>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
