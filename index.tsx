/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { AdminPage } from "./AdminPage";
import "antd/dist/reset.css"; // dùng cho Ant Design v5+
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
