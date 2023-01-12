import React from "react"
import useAuth from "../../../hooks/auth"
import CurrencyFormat from "react-currency-format"
import { RiBankCardLine } from "react-icons/ri"
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore"
import { db, storage } from "../../../config/firebase"
import { useNavigate } from "react-router-dom"
import { ref, uploadBytes } from "firebase/storage"

export default function PublisherHomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [balance, setBalance] = React.useState(0)
  const [liveStreamName, setLiveStreamName] = React.useState("")

  const [forBankFullName, setForBankFullName] = React.useState("")
  const [forBankIban, setForBankIban] = React.useState("")
  const [forBankName, setForBankName] = React.useState("")

  const [liveStreamImage, setLiveStreamImage] = React.useState(null)

  const [liveStreams, setLiveStreams] = React.useState([])
  const [userData, setUserData] = React.useState({})

  const createLiveStrem = async () => {
    getUserData(user.uid).then(async (res) => {
      try {
        const data = {
          liveStreamName,
          userId: user.uid,
          isLive: false,
          isPublished: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userName: res.fullname,
        }
        const docRef = await addDoc(collection(db, "liveStreams"), data)

        setLiveStreamName("")

        alert("Live stream created successfully")

        console.log("Document written with ID: ", docRef.id)

        // const blob = URL.createObjectURL(liveStreamImage)

        const storageRef = ref(storage, `liveStreams/${docRef.id}`)

        uploadBytes(storageRef, liveStreamImage).then((snapshot) => {
          console.log("Uploaded a blob or file!")
        })
      } catch (e) {
        console.error("Error adding document: ", e)
      }
    })
  }

  const [donates, setDonates] = React.useState([])

  const getMyDonates = async () => {
    const q = query(
      collection(db, "donates"),
      where("admin_confirmation", "==", 1),
      where("userId", "==", user.uid)
    )
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      list.push({
        ...doc.data(),
        id: doc.id,
      })

      setDonates(list)
    })
  }

  const getUserData = async (userId) => {
    const q = query(collection(db, "users"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      list.push({
        ...doc.data(),
        id: doc.id,
      })
    })

    return list[0]
  }

  const [users, setUsers] = React.useState([])
  const getUsers = async () => {
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q)

    const list = []
    querySnapshot.forEach((doc) => {
      list.push({
        ...doc.data(),
        id: doc.id,
      })

      setUsers(list)
    })
  }
  const myLiveStreams = () => {
    const q = query(
      collection(db, "liveStreams"),
      where("userId", "==", user.uid)
    )
    const unsubsribe = onSnapshot(q, (querySnapshot) => {
      const list = []
      querySnapshot.forEach((doc) => {
        list.push({
          ...doc.data(),
          id: doc.id,
        })

        setLiveStreams(list)
      })
    })
  }

  React.useEffect(() => {
    if (user) {
      getBalance()
      myLiveStreams()
      getMyDonates()
      getUsers()
      getMoneyRequests()
    }
  }, [user])

  const getBalance = () => {
    const q = query(collection(db, "users"), where("userId", "==", user.uid))
    const unsubsribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setUserData({
          ...doc.data(),
          id: doc.id,
        })
        setBalance(doc.data().balance)
      })
    })
  }

  const [moneyAmount, setMoneyAmount] = React.useState(0)
  const getMoneyRequest = async () => {
    if (moneyAmount > balance) {
      alert("You don't have enough money")
      return
    }

    const data = {
      userId: user.uid,
      amount: moneyAmount,
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      bankName: forBankName,
      bankIban: forBankIban,
      bankFullName: forBankFullName,
    }

    const docRef = await addDoc(collection(db, "moneyRequests"), data)

    // update user balance

    const userRef = await setDoc(
      doc(db, "users", userData.id),
      {
        balance: balance - moneyAmount,
      },
      { merge: true }
    )

    alert("Money request sent successfully Admin confirmation is required")
  }

  const [moneyRequests, setMoneyRequests] = React.useState([])

  const getMoneyRequests = async () => {
    const q = query(
      collection(db, "moneyRequests"),
      where("userId", "==", user.uid)
    )

    onSnapshot(q, (querySnapshot) => {
      setMoneyRequests([])
      querySnapshot.forEach((doc) => {
        let date = doc.data().createdAt.toDate()
        date = date.toLocaleDateString("tr-tr", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })
        setMoneyRequests((prev) => [
          ...prev,
          {
            ...doc.data(),
            id: doc.id,
            date: date,
          },
        ])
      })
    })
  }

  return (
    <div>
      <div className="mt-4 flex justify-end items-center  ">
        <div className="border-b border-black w-32 flex justify-end items-center space-x-2">
          <RiBankCardLine size={25} />
          <CurrencyFormat
            value={balance}
            displayType={"text"}
            thousandSeparator={true}
            prefix={"$"}
            renderText={(value) => <div>{value}</div>}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <div className="bg-white p-4 rounded-md shadow-md">
          <h1>Create live stream </h1>
          <div className="mt-2">
            <label
              htmlFor="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Live Stream Title
            </label>
            <input
              type="text"
              id="first_name"
              value={liveStreamName}
              onChange={(e) => setLiveStreamName(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="mt-2">
            <label
              htmlFor="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Live Stream Image
            </label>
            <input
              onChange={(e) => {
                setLiveStreamImage(e.target.files[0])
              }}
              type="file"
              id="first_name"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="mt-2">
            <button
              onClick={createLiveStrem}
              type="button"
              className="focus:outline-none text-white bg-[#1F2937] hover:bg-[#2e3847] focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            >
              Create a live stream
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          <h1>My liveStreams </h1>
          {liveStreams.map((liveStream) => (
            <div
              key={liveStream.id}
              className="flex items-center justify-between w-full border-b"
            >
              <div className="my-2">{liveStream.liveStreamName}</div>

              <div
                onClick={() =>
                  navigate(
                    `/live-streams/${liveStream.id}/${liveStream.userId}`
                  )
                }
                className="cursor-pointer"
              >
                Go live
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          <h1> Withdraw money</h1>

          <div className="mt-2">
            <label
              htmlFor="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Full Name
            </label>
            <input
              onChange={(e) => setForBankFullName(e.target.value)}
              type="text"
              id="first_name"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="mt-2">
            <label
              htmlFor="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              IBAN
            </label>
            <input
              onChange={(e) => setForBankIban(e.target.value)}
              type="number"
              id="first_name"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="mt-2">
            <label
              htmlFor="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Bank Name
            </label>
            <input
              onChange={(e) => setForBankName(e.target.value)}
              type="text"
              id="first_name"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="mt-2">
            <label
              htmlFor="first_name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Amount
            </label>
            <input
              type="text"
              id="first_name"
              value={moneyAmount}
              onChange={(e) => setMoneyAmount(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="mt-2">
            <button
              onClick={getMoneyRequest}
              type="button"
              className="focus:outline-none text-white bg-[#1F2937] hover:bg-[#2e3847] focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            >
              Get Money
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          <h1 className="mb-2">Donates</h1>
          {donates.map((donate) => {
            const user = users.find((user) => user.userId === donate.userId)
            return (
              <div
                key={donate.id}
                className="border-b pb-2 mb-2 hover:bg-gray-50"
              >
                {user?.email} - {donate?.amount} $
              </div>
            )
          })}
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          <h1>Money Requests</h1>
          {moneyRequests.map((moneyRequest) => {
            return (
              <div
                key={moneyRequest.id}
                className="border-b pb-2 my-2 hover:bg-gray-50"
              >
                <div>
                  {moneyRequest.date} - {moneyRequest?.amount} $
                </div>

                <div>Status: {moneyRequest?.status ? "Done" : "Pending"}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
