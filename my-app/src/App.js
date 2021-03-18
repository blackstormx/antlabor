import React, { useState } from "react";
import css from "./scss/main.module.scss";
import jobPostcss from "./scss/jobPost.module.scss";
import greenButtoncss from "./scss/greenButton.module.scss";
import Modal from "./components/widgets/modal";

import Navbar from "./components/widgets/Navbar";
// import SignIn from "./SignIn";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faSearch,
   faBell,
   faEnvelope,
   faCog,
   faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
if (!firebase.apps.length) {
   firebase.initializeApp({
      apiKey: "AIzaSyBVQzqpkCJNFUeyah0q60JCESyfr_4kvcs",
      authDomain: "antlabor-2b524.firebaseapp.com",
      projectId: "antlabor-2b524",
      storageBucket: "antlabor-2b524.appspot.com",
      messagingSenderId: "665687381453",
      appId: "1:665687381453:web:37ae94b9e8ae89bbe62084",
      measurementId: "G-X07R2J9H2H",
   });
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
   const [selectedTab, setTab] = useState("ახალი");
   const [user] = useAuthState(auth);

   const jobsRef = firestore.collection("jobs");
   const query = jobsRef.orderBy("createdAt").limit(25);

   const [jobs] = useCollectionData(query, { idField: "id" });

   const [visible, setVisible] = useState(false);

   const [jobTitle, setJobTitle] = useState("");
   const [jobDescription, setJobDescription] = useState("");
   const [jobPay, setJobPay] = useState(0.01);

   const [isFetching, setFetching] = useState(false);

   const addJob = async (e) => {
      setFetching(true);
      const { uid } = auth.currentUser;
      await jobsRef.add({
         location: "Georgia",
         title: jobTitle,
         description: jobDescription,
         pay: jobPay,
         user: uid,
         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      });

      setJobTitle("");
      setJobDescription("");
      setJobPay(0.01);

      setVisible(false);
      setFetching(false);
   };

   return user ? (
      <div className={css.main}>
         <Modal visible={visible} onClick={() => setVisible(false)}>
            <div className={css.inModal}>
               <ModalRow
                  title="სათაური"
                  onChange={setJobTitle}
                  value={jobTitle}
                  disabled={isFetching}
               />
               <ModalRow
                  title="აღწერა"
                  onChange={setJobDescription}
                  value={jobDescription}
                  multiRow
                  disabled={isFetching}
               />
               <ModalRow
                  title="ხელფასი"
                  onChange={setJobPay}
                  value={jobPay}
                  disabled={isFetching}
               />

               <button
                  className={greenButtoncss.button}
                  onClick={addJob}
                  disabled={isFetching}
               >
                  დამატება
               </button>
            </div>
         </Modal>
         <div className={css.topbar}>
            <div className={css.search}>
               <span>
                  <FontAwesomeIcon icon={faSearch} />
               </span>
               <input type="text" placeholder="მოძიება" />
            </div>
            <span className={css.logo}>
               <img src="logo.png" />
            </span>
            <span className={css.li}>
               <FontAwesomeIcon icon={faCog} />
            </span>
            <span className={css.li}>
               <FontAwesomeIcon icon={faBell} />
            </span>
            <span className={css.li}>
               <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <span className={css.li}>
               <span className={css.profileIcon}></span>
            </span>
            <span className={css.li} onClick={SignOut}>
               <FontAwesomeIcon icon={faSignOutAlt} />
            </span>
         </div>
         <div className={css.mainFlex}>
            <Navbar selectedTab={selectedTab} onSelect={setTab} />
            <div className={css.side}>
               <div>
                  <button
                     className={greenButtoncss.button}
                     onClick={() => setVisible(true)}
                  >
                     სამუშაოს შექმნა
                  </button>
               </div>
               <div>
                  {jobs &&
                     jobs
                        .reverse()
                        .map((job) => <JobPost key={job.id} job={job} />)}
               </div>
            </div>
         </div>
      </div>
   ) : (
      <SignIn />
   );
}
export default App;

function SignIn() {
   const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
   };
   return (
      <div className={css.googleSignIn}>
         <div>
            <img src="logo.png" />
            <button onClick={signInWithGoogle}>Sign in with Google</button>
         </div>
      </div>
   );
}

function SignOut() {
   return auth.currentUser && auth.signOut();
}

function JobPost(props) {
   const { title, description, pay } = props.job;
   return (
      <div className={jobPostcss.jobPost}>
         <div className={jobPostcss.title}>{title}</div>
         <div className={jobPostcss.pay}>
            <span>Hourly: ₾{pay}</span> - beginner. 1 - 3 days
         </div>
         <div className={jobPostcss.description}>{description}</div>
         <div className={jobPostcss.bottom}>
            <button className={greenButtoncss.button}>
               სერვისის შეთავაზება
            </button>
         </div>
      </div>
   );
}
function ModalRow(props) {
   const { title, onChange, value, multiRow, disabled } = props;
   return (
      <div className={css.modalRow}>
         {multiRow
            ? [
                 <div>{title}:</div>,
                 <textarea
                    onChange={(e) => onChange(e.target.value)}
                    value={value}
                    placeholder={`ჩაწერეთ ${title} აქ...`}
                    disabled={disabled}
                 ></textarea>,
              ]
            : [
                 <span>{title}:</span>,
                 <input
                    type="text"
                    onChange={(e) => onChange(e.target.value)}
                    value={value}
                    placeholder={`ჩაწერეთ ${title} აქ...`}
                    disabled={disabled}
                 />,
              ]}
      </div>
   );
}
