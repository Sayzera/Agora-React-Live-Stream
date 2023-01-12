import React from "react"
import useAuth from "../../../hooks/auth"
import CurrencyFormat from "react-currency-format"
import { RiBankCardLine } from "react-icons/ri"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db, storage } from "../../../config/firebase"
import { useNavigate } from "react-router-dom"
import { getDownloadURL, ref } from "firebase/storage"

import questionImage from "../../../assets/img/question.jpg"

export default function HomeScreen() {
  const { user } = useAuth()
  const [balance, setBalance] = React.useState(0)
  const [liveStreams, setLiveStreams] = React.useState([])
  const [getLiveStreamsImageState, setGetLiveStreamsImageState] =
    React.useState([])

  const [searchLiveStreamData, setSearchLiveStreamData] = React.useState([])
  const [searchPublisher, setSearchPublisher] = React.useState("")

  const navigate = useNavigate()
  React.useEffect(() => {
    if (user) {
      getBalance()
    }
  }, [user])

  React.useEffect(() => {
    getLiveStreamsImage()
  }, [liveStreams])

  const getBalance = () => {
    const q = query(collection(db, "users"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setBalance(doc.data().balance)
      })
    })
  }

  // const liveStreamImageRef = ref(storage, `liveStreams/${doc.id}`)

  // let liveImage = await getDownloadURL(liveStreamImageRef)

  const getLiveStreamsImage = async () => {
    setGetLiveStreamsImageState([])
    liveStreams.map(async (item) => {
      const liveStreamImageRef = ref(storage, `liveStreams/${item.id}`)

      let liveImage = await getDownloadURL(liveStreamImageRef)

      setGetLiveStreamsImageState((prev) => [
        ...prev,
        {
          id: item.id,
          image: liveImage,
        },
      ])
    })
  }

  const getLiveStreams = () => {
    const q = query(collection(db, "liveStreams"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let list = []
      querySnapshot.forEach(async (doc) => {
        // resmi var mı ?

        list.push({
          ...doc.data(),
          id: doc.id,
        })

        setLiveStreams(list)
      })
    })
  }

  React.useEffect(() => {
    getLiveStreams()
  }, [])

  React.useEffect(() => {
    setSearchLiveStreamData(liveStreams)
  }, [liveStreams])

  const filterPublisher = () => {
    console.log(liveStreams)
    let newResault = liveStreams.filter((item) => {
      if (!searchPublisher) return true
      return item?.userName
        ?.toLowerCase()
        .includes(searchPublisher.toLowerCase())
    })

    setSearchLiveStreamData(newResault)
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
      <div className="bg-white p-4 rounded-md shadow-md mt-4 ">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            onChange={(e) => setSearchPublisher(e.target.value)}
            type="search"
            id="default-search"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for publisher"
            required
          />
          <button
            onClick={filterPublisher}
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
        <h1 className="mb-4">LiveStreams </h1>
        <div className="grid md:grid-cols-4 gap-4">
          {searchLiveStreamData?.map((liveStream) => (
            <div
              key={liveStream.id}
              className="justify-between w-full border-b"
            >
              <div>
                <img
                  src={
                    getLiveStreamsImageState.find(
                      (item) => item.id === liveStream.id
                    )?.image
                  }
                  alt=""
                  className=""
                />
              </div>
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

        <div className="mt-4 border border-dashed border-gray-800 mb-5">
          <div className="bg-white p-4 rounded-md shadow-md  ">
            You can rent this place for adds
          </div>
        </div>
      </div>
    </div>
  )
}
