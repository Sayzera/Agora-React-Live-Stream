import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../../config/firebase"

export default function Login() {
  const navigate = useNavigate()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const getUserType = async (uid) => {
    const userRef = query(collection(db, "users"), where("userId", "==", uid))
    const querySnapshot = await getDocs(userRef)
    querySnapshot.forEach((doc) => {
      const userType = doc.data().userType

      if (userType === "admin") {
        navigate("/admin-home")
      } else if (userType === "user") {
        navigate("/user-home")
      } else if (userType === "publisher") {
        navigate("/publisher-home")
      }
    })
  }

  const onSubmit = (data) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const {
          user: { uid },
        } = userCredential
        getUserType(uid)
        // navigate("/user-home")
      })
      .catch((error) => {
        alert("Invalid email or password")
        console.log(error.message)
      })
  }
  return (
    <div className="container mx-auto mt-5  ">
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-400 pb-2 mb-4  px-2">
          Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
              })}
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@flowbite.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic px-1 pt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your password
            </label>
            <input
              {...register("password", {
                required: "Password is required",
              })}
              type="password"
              id="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic px-1 pt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-start mb-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center h-5">
                <input
                  id="remember"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <div>
                <span
                  onClick={() => navigate("register")}
                  className="font-medium text-sm underline cursor-pointer"
                >
                  Register
                </span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}
