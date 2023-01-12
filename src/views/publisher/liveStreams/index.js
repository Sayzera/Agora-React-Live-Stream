import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import LiveStream from "../../../components/LiveStream"
import { db } from "../../../config/firebase"
import useAuth from "../../../hooks/auth"

export default function LiveStreams() {
  const { id, userId } = useParams()
  const [chats, setChats] = React.useState([])
  const [message, setMessage] = React.useState("")
  const [donate, setDonate] = React.useState(5)

  const { user } = useAuth()

  const addDonateToPublisher = async (userid, donate) => {
    const q = query(collection(db, "users"), where("userId", "==", userid))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (doc_) => {
      await setDoc(
        doc(db, "users", doc_.id),
        {
          balance: increment(donate),
        },
        {
          merge: true,
        }
      )

      alert("Donate successfull")
    })
  }

  const addDonate = async () => {
    try {
      // let data = {
      //   admin_confirmation: 0,
      //   amount: donate,
      //   user_confirmation: 0,
      //   userId: userId,
      //   donaterId: user.uid,
      // }
      addDonateToPublisher(userId, donate)

      await setDoc(
        doc(db, "users", userId),
        {
          balance: increment(donate),
        },
        // sadece belirtilen alanı güncelle
        { merge: true }
      )

      // const docRef = await addDoc(collection(db, "donates"), data)

      const q = query(collection(db, "users"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async (doc_) => {
        await setDoc(
          doc(db, "users", doc_.id),
          {
            balance: increment(-donate),
          },
          {
            merge: true,
          }
        )

        alert("Donate successfull")
      })
    } catch (e) {
      console.log(e)
    }
  }

  const navigate = useNavigate()

  const addChat = async () => {
    let data = {
      message,
      userId: user.uid,
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      chatId: id,
    }

    const docRef = await addDoc(collection(db, "chats"), data)

    console.log("Document written with ID: ", docRef.id)
    setMessage("")
  }

  const getChats = () => {
    const q = query(
      collection(db, "chats"),
      where("chatId", "==", id),
      orderBy("createdAt", "asc")
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = []
      querySnapshot.forEach((doc) => {
        let date = doc.data().createdAt.toDate()
        // tr
        date = date.toLocaleString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })

        list.push({
          ...doc.data(),
          id: doc.id,
          date: date,
        })

        setChats(list)
      })
    })
  }

  React.useEffect(() => {
    getChats()
  }, [])

  console.log(chats)

  return (
    <div className="mt-4">
      <div className="mb-4 cursor-pointer text-blue-500">
        <span
          onClick={() => {
            navigate(-1)
          }}
        >
          Go Back
        </span>
      </div>

      <div className="mt-4 border border-dashed border-gray-800 mb-5">
        <div className="bg-white p-4 rounded-md shadow-md  ">
          You can rent this place for adds
        </div>
      </div>
      <div className="grid md:grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-md shadow-md">
          <div>Live stream id: {id}</div>
          <div className="flex items-center justify-between my-2">
            <select
              onChange={(e) => setDonate(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="5">5 $</option>
              <option value="10">10 $</option>
              <option value="15">15 $</option>
              <option value="20">20 $</option>
              <option value="25">25 $</option>
              <option value="30">30 $</option>
              <option value="35">35 $</option>
              <option value="40">40 $</option>
            </select>

            <button
              onClick={addDonate}
              className="bg-black text-white rounded-md px-4 py-2 ml-2"
            >
              Donate
            </button>
          </div>
          <LiveStream id={id} />

          <div id="live-container"></div>
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          <h1>Chats</h1>

          <div className="h-[18rem] overflow-y-auto">
            {chats.map((chat) => (
              <div key={chat.id} className="my-2 border-b pb-2">
                <div className="flex flex-col">
                  <div className=" text-sm">{chat.email}</div>
                  <div>message: {chat.message} </div>
                  <div className="text-xs">{chat.date}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <textarea
              id="message"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Write your thoughts here..."
            ></textarea>

            <div className="flex justify-end">
              <button
                onClick={() => addChat()}
                className="bg-black text-white rounded-md px-4 py-2 mt-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border border-dashed border-gray-800">
        <div className="bg-white p-4 rounded-md shadow-md  ">
          You can rent this place for adds
        </div>
      </div>
    </div>
  )
}
