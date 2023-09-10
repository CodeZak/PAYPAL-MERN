import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Paypal } from "./components/paypal";

const initialOptions = {
    "client-id": "",
    // Move this to `env` file later
    currency: "USD",
    components: "buttons",
    vault: true,
    intent: "subscription",
};

function App() {
    return (
        <div className="App">
            <PayPalScriptProvider options={initialOptions}>
                <Paypal />
            </PayPalScriptProvider>
        </div>
    );
}

export default App;
