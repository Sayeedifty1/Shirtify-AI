
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import state from "../store";
import { download } from "../assets";
import { downloadCanvasToImage, reader } from "../config/helpers";
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants";
import { fadeAnimation, slideAnimation } from "../config/motion";
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from "../components";
import PaymentForm from "./PaymentForm";
import { useStripe } from "@stripe/react-stripe-js";
import { dalleApiCall } from "../config/openai";
import { hostImage } from "../config/Host";



const Customizer = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false); // Define the state setter
  const [isPaymentComplete, setIsPaymentComplete] = useState(false); // Define the state setter 
  const stripe = useStripe();

  const handlePayment = async (paymentMethodId, amount, onComplete) => {
    try {
      setIsPaymentProcessing(true);

      const response = await fetch("http://localhost:8080/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "usd",
        }),
      });

      const data = await response.json();
      const clientSecret = data.clientSecret;

      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      setShowPaymentModal(false); // Close the modal after payment processing

      if (result.error) {
        console.error(result.error.message);
        alert("Payment failed. Please try again.");
        setIsPaymentProcessing(false); // Reset the processing state in case of error
      } else if (result.paymentIntent.status === "succeeded") {
        setIsPaymentProcessing(false);
        setIsPaymentComplete(true);
        downloadCanvasToImage();
        onComplete(); // Call the callback function to handle the payment completion
      }
    } catch (error) {
      console.error(error.message);
      setIsPaymentProcessing(false);
      alert("Something went wrong. Please try again.");
    }
  };




  const handleDownload = () => {
    if (paymentAmount > 0) {
      setShowPaymentModal(true);
    } else {
      downloadCanvasToImage();
    }
  };



  useEffect(() => {
    switch (selectedOption) {
      case "colorpicker":
        setPaymentAmount(68); // 0.68$
        break;
      case "filepicker":
        setPaymentAmount(270); // 2.70$
        break;
      case "aipicker":
        setPaymentAmount(500); // 5.00$
        break;
      default:
        setPaymentAmount(0); // No payment needed if nothing selected
    }
  }, [selectedOption]);

  const handleTabClick = (tabName) => {
    setSelectedOption(tabName);
    setActiveEditorTab(tabName);
  };
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');

  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  })

  // show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />
      case "filepicker":
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case "aipicker":
        return <AIPicker
          prompt={prompt}
          setPrompt={setPrompt}
          generatingImg={generatingImg}
          handleSubmit={handleSubmit}
        />
      default:
        return null;
    }
  }
  console.log(paymentAmount)



  // const handleSubmit = async (type) => {
  //   if (!prompt) return alert("Please enter a prompt");

  //   try {
  //     setGeneratingImg(true);

  //     const response = await fetch('https://shopify-server-smoky.vercel.app/api/v1/dalle', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         prompt,
  //       })
  //     })

  //     const data = await response.json();

  //     handleDecals(type, `data:image/png;base64,${data.photo}`)
  //   } catch (error) {
  //     alert(error)
  //   } finally {
  //     setGeneratingImg(false);
  //     setActiveEditorTab("");
  //   }
  // }
  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter a prompt");

    try {
      setGeneratingImg(true);

      const apiResponse = await dalleApiCall(prompt);

      if (apiResponse.success) {
        const imageUrl = apiResponse.imageContent; // Updated to use 'imageContent'

        if (imageUrl) {
          // Host the image URL using hostImage function
          const hostedImageUrl = await hostImage(imageUrl);

          if (hostedImageUrl) {
            // Pass the hosted URL to handleDecals function
            handleDecals(type, hostedImageUrl);
          } else {
            alert("Image hosting failed");
          }
        } else {
          alert("No image URL found in the API response");
        }
      } else {
        alert("API call failed: " + apiResponse.msg);
      }
    } catch (error) {
      alert(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  };

  const handleDecals = (type, result) => {
    console.log("Result from AI:", result);

    const decalType = DecalTypes[type];

    // Assuming 'state' is your state object that holds the properties
    state[decalType.stateProperty] = result;

    // Assuming 'activeFilterTab' is another state object
    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    // after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setActiveEditorTab("");
      })
  }
  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation("left")}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => handleTabClick(tab.name)
                    } />


                ))}
                {generateTabContent()}
                {/* {activeEditorTab} */}
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => state.intro = true}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            ></CustomButton>
          </motion.div>
          <motion.div
            className="filtertabs-container "
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActive={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)} />
            ))}
            <img src={download} className="w-[36px]" onClick={handleDownload} alt="download" />
          </motion.div>

        </>

      )}
      {showPaymentModal && (
        <PaymentForm
          key={1}
          paymentAmount={paymentAmount}
          onSubmit={handlePayment}
          onComplete={() => setShowPaymentModal(false)}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}

    </AnimatePresence>
  )
}

export default Customizer;