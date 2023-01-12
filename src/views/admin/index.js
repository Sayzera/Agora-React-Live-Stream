import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import React from "react"
import { db } from "../../config/firebase"

export default function AdminHome() {
  const [depositBalanceList, setDepositBalanceList] = React.useState([])
  const [users, setUsers] = React.useState([])

  const [donateList, setDonateList] = React.useState([])
  /**
   * sisteme para yatırılan bakiyeleri listeler
   */
  const getUserBalanceList = () => {
    const q = query(
      collection(db, "pays"),
      where("admin_confirmation", "==", 0)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = []

      if (querySnapshot.docs.length === 0) {
        setDepositBalanceList([])
        return
      }
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        list.push({
          ...data,
          id: doc.id,
        })

        setDepositBalanceList(list)
      })
    })
  }

  const [moneyRequestList, setMoneyRequestList] = React.useState([])
  const getMoneyRequestList = () => {
    const q = query(collection(db, "moneyRequests"), where("status", "==", 0))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMoneyRequestList([])
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        data.id = doc.id
        setMoneyRequestList((prev) => [...prev, data])
      })
    })
  }

  // kullanıcıları listeler
  const getUsers = async () => {
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      list.push({
        ...data,
        uid: doc.id,
      })

      setUsers(list)
    })
  }

  const updateBalance = async (id, amount, userId) => {
    await setDoc(
      doc(db, "pays", id),
      {
        admin_confirmation: 1,
      },
      // sadece belirtilen alanı güncelle
      { merge: true }
    )

    await setDoc(
      doc(db, "users", userId),
      {
        balance: increment(amount),
      },
      // sadece belirtilen alanı güncelle
      { merge: true }
    )
  }
  const updateDonate = async (id, amount, userId) => {
    await setDoc(
      doc(db, "donates", id),
      {
        admin_confirmation: 1,
      },
      // sadece belirtilen alanı güncelle
      { merge: true }
    )

    await setDoc(
      doc(db, "users", userId),
      {
        balance: increment(amount),
      },
      // sadece belirtilen alanı güncelle
      { merge: true }
    )
  }

  const updateMoneyRequest = async (id, amount, userId) => {
    await setDoc(
      doc(db, "moneyRequests", id),
      {
        status: 1,
      },
      // sadece belirtilen alanı güncelle
      { merge: true }
    )
  }

  // get donate list

  const getDonateList = () => {
    const q = query(
      collection(db, "donates"),
      where("admin_confirmation", "==", 0)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = []

      if (querySnapshot.docs.length === 0) {
        setDonateList([])
        return
      }
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        list.push({
          ...data,
          id: doc.id,
        })

        setDonateList(list)
      })
    })
  }

  React.useEffect(() => {
    getUserBalanceList()
    getUsers()
    getDonateList()
    getMoneyRequestList()
  }, [])

  return (
    <div className="grid md:grid-cols-2 gap-5 mt-4">
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-400 pb-2 mb-4  px-2">
            Deposit Request
          </h1>

          <div className="overflow-x-auto">
            {users?.length > 0 && depositBalanceList?.length > 0 ? (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">User</th>
                    <th className="border px-4 py-2">Amount</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depositBalanceList.map((item, index) => {
                    // kullanıcıyı bul
                    let user = users.find((user) => user.userId == item.userId)

                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2">{user?.email}</td>
                        <td className="border px-4 py-2">{item.price}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => {
                              updateBalance(item.id, item.price, user.uid)
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                          >
                            Confirm
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p>There is no deposit request. Please check again later</p>
            )}
          </div>
        </div>
      </div>
      {/* <div className="bg-white p-5 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-400 pb-2 mb-4  px-2">
          Donete Request
        </h1>

        <div className="overflow-x-auto">
          {users?.length > 0 && donateList?.length > 0 ? (
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">User</th>
                  <th className="border px-4 py-2">Amount</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donateList.map((item, index) => {
                  // kullanıcıyı bul
                  let user = users.find((user) => user.userId == item.userId)

                  return (
                    <tr key={index}>
                      <td className="border px-4 py-2">{user?.email}</td>
                      <td className="border px-4 py-2">{item.amount}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => {
                            updateDonate(item.id, item.amount, user.uid)
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p>There is no Donate request. Please check again later</p>
          )}
        </div>
      </div> */}

      <div className="bg-white p-5 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-400 pb-2 mb-4  px-2">
          Money Request List
        </h1>

        <div className="overflow-x-auto">
          {users?.length > 0 && moneyRequestList?.length > 0 ? (
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">User</th>
                  <th className="border px-4 py-2">Amount</th>
                  <th className="border px-4 py-2">Total Money</th>
                  <th className="border px-4 py-2">IBAN</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {moneyRequestList.map((item, index) => {
                  // kullanıcıyı bul
                  let user = users.find((user) => user.userId == item.userId)

                  return (
                    <tr key={index}>
                      <td className="border px-4 py-2">{user?.email}</td>
                      <td className="border px-4 py-2">{item.amount}</td>
                      <td className="border px-4 py-2">
                        {parseInt(user.balance) + parseInt(item.amount)}
                      </td>
                      <td className="border px-4 py-2">{item.bankIban} </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => {
                            updateMoneyRequest(item.id, item.amount, user.uid)
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p>There is no Money request. Please check again later</p>
          )}
        </div>
      </div>
    </div>
  )
}
