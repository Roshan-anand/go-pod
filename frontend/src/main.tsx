import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./providers/redux/store.ts";
import { Bounce, ToastContainer } from "react-toastify";
import App from "./App.tsx";
import WrtcCtxtProvider from "./providers/context/wRTC/provider.tsx";
import WsCtxtProvider from "./providers/context/socket/provider.tsx";
import "@/styles/index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      draggable
      pauseOnHover
      theme="dark"
      transition={Bounce}
    />
    <Provider store={store}>
      <WsCtxtProvider>
        <WrtcCtxtProvider>
          <App />
        </WrtcCtxtProvider>
      </WsCtxtProvider>
    </Provider>
  </StrictMode>
);
