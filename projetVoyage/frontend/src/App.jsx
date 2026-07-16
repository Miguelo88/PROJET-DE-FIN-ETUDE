import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import {ChatBot} from "./composants/shared/ChatBot";  

// export default function App() {
//   return <RouterProvider router={router} />;
// }


export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ChatBot />
    </>
  );
}