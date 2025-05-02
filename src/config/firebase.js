import * as firebase from 'firebase';
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyC-gdG91BozNwWhABLDQmDsiA4QHeHDC_Y",
    authDomain: "quick-food-delivery-daksh.firebaseapp.com",
    projectId: "quick-food-delivery-daksh",
    storageBucket: "quick-food-delivery-daksh.firebasestorage.app",
    messagingSenderId: "190725116225",
    appId: "1:190725116225:web:b31f6200a14c1b00c751c0"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// function signUp(userDetails) {
//     return new Promise((resolve, reject) => {
//         const { userName, userEmail, userPassword, userCity, userCountry, userGender, userAge, userProfileImage, isRestaurant, typeOfFood } = userDetails;
//         firebase.auth().createUserWithEmailAndPassword(userDetails.userEmail, userDetails.userPassword).then((success) => {
//             let user = firebase.auth().currentUser;
//             var uid;
//             if (user != null) {
//                 uid = user.uid;
//             };
//             firebase.storage().ref().child(`userProfileImage/${uid}/` + userProfileImage.name).put(userProfileImage).then((url) => {
//                 url.ref.getDownloadURL().then((success) => {
//                     const userProfileImageUrl = success
//                     console.log(userProfileImageUrl)
//                     const userDetailsForDb = {
//                         userName: userName,
//                         userEmail: userEmail,
//                         userPassword: userPassword,
//                         userCity: userCity,
//                         userCountry: userCountry,
//                         userGender: userGender,
//                         userAge: userAge,
//                         userUid: uid,
//                         isRestaurant: isRestaurant,
//                         userProfileImageUrl: userProfileImageUrl,
//                         typeOfFood: typeOfFood,
//                     }
//                     db.collection("users").doc(uid).set(userDetailsForDb).then((docRef) => {
//                         // console.log("Document written with ID: ", docRef.id);
//                         if(userDetailsForDb.isRestaurant){
//                             userDetails.propsHistory.push("/order-requests");
//                             resolve(userDetailsForDb)
//                         }else{
//                             userDetails.propsHistory.push("/");
//                             resolve(userDetailsForDb)
//                         }
//                     }).catch(function (error) {
//                         console.error("Error adding document: ", error);
//                         reject(error)
//                     })
//                 }).catch((error) => {
//                     // Handle Errors here.
//                     let errorCode = error.code;
//                     let errorMessage = error.message;
//                     console.log("Error in getDownloadURL function", errorMessage);
//                     reject(errorMessage)
//                 })
//             }).catch((error) => {
//                 // Handle Errors here.
//                 let errorCode = error.code;
//                 let errorMessage = error.message;
//                 console.log("Error in Image Uploading", errorMessage);
//                 reject(errorMessage)
//             })
//         }).catch((error) => {
//             var errorMessage = error.message;
//             console.log("Error in Authentication", errorMessage);
//             reject(errorMessage)
//         })
//     })
// }
function signUp(userDetails) {
    return new Promise(async (resolve, reject) => {
        const {
            userName,
            userEmail,
            userPassword,
            userCity,
            userCountry,
            userGender,
            userAge,
            userProfileImage,
            isRestaurant,
            typeOfFood,
            propsHistory // Make sure you pass this in userDetails
        } = userDetails;

        try {
            // 1. Create Firebase user
            const authResult = await firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword);
            const uid = authResult.user.uid;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", userProfileImage);
            formData.append("upload_preset", "quick-food-delivery"); // Replace
            formData.append("cloud_name", "depscilcs"); // Replace

            const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/depscilcs/image/upload", {
                method: "POST",
                body: formData
            });

            const cloudinaryData = await cloudinaryResponse.json();
            const userProfileImageUrl = cloudinaryData.secure_url;

            // 3. Save user details to Firestore
            const userDetailsForDb = {
                userName,
                userEmail,
                userPassword,
                userCity,
                userCountry,
                userGender,
                userAge,
                userUid: uid,
                isRestaurant,
                userProfileImageUrl,
                typeOfFood,
            };

            await db.collection("users").doc(uid).set(userDetailsForDb);

            // 4. Redirect
            if (isRestaurant) {
                propsHistory.push("/order-requests");
            } else {
                propsHistory.push("/");
            }

            resolve(userDetailsForDb);
        } catch (error) {
            console.error("Signup Error:", error);
            reject(error.message || "Signup failed");
        }
    });
}


function logIn(userLoginDetails) {
    return new Promise((resolve, reject) => {
        const { userLoginEmail, userLoginPassword } = userLoginDetails;
        firebase.auth().signInWithEmailAndPassword(userLoginEmail, userLoginPassword).then((success) => {
            db.collection('users').doc(success.user.uid).get().then((snapshot) => {
                console.log("snapshot.data =>>", snapshot.data().isRestaurant);
                if(snapshot.data().isRestaurant){
                    userLoginDetails.propsHistory.push("/order-requests");
                    resolve(success)
                }else{
                    userLoginDetails.propsHistory.push("/");
                    resolve(success)
                }             
            })
        }).catch((error) => {
            // Handle Errors here.
            // var errorCode = error.code;
            var errorMessage = error.message;
            reject(errorMessage)
        });

    })
}

// function addItem(itemDetails) {
//     const { itemTitle, itemIngredients, itemPrice, itemImage, chooseItemType, } = itemDetails;
//     return new Promise((resolve, reject) => {
//         let user = firebase.auth().currentUser;
//         var uid;
//         if (user != null) {
//             uid = user.uid;
//         };
//         firebase.storage().ref().child(`itemImage/${uid}/` + itemImage.name).put(itemImage).then((url) => {
//             url.ref.getDownloadURL().then((success) => {
//                 const itemImageUrl = success
//                 console.log(itemImageUrl)
//                 const itemDetailsForDb = {
//                     itemTitle: itemTitle,
//                     itemIngredients: itemIngredients,
//                     itemPrice: itemPrice,
//                     itemImageUrl: itemImageUrl,
//                     chooseItemType: chooseItemType,
//                     // userUid: uid,
//                 }
//                 db.collection("users").doc(uid).collection("menuItems").add(itemDetailsForDb).then((docRef) => {
//                     // console.log("Document written with ID: ", docRef.id);
//                     // itemDetails.propsHistory.push("/my-foods");
//                     resolve("Successfully added food item")
//                 }).catch(function (error) {
//                     let errorCode = error.code;
//                     let errorMessage = error.message;
//                     reject(errorMessage)
//                     // console.error("Error adding document: ", error);
//                 })
//             }).catch((error) => {
//                 // Handle Errors here.
//                 let errorCode = error.code;
//                 let errorMessage = error.message;
//                 console.log("Error in getDownloadURL function", errorCode);
//                 console.log("Error in getDownloadURL function", errorMessage);
//                 reject(errorMessage)
//             })
//         }).catch((error) => {
//             // Handle Errors here.
//             let errorCode = error.code;
//             let errorMessage = error.message;
//             console.log("Error in Image Uploading", errorMessage);
//             reject(errorMessage)
//         })
//     })
// }
function addItem(itemDetails) {
    const { itemTitle, itemIngredients, itemPrice, itemImage, chooseItemType } = itemDetails;

    return new Promise(async (resolve, reject) => {
        try {
            console.log("inside addItem()")
            const user = firebase.auth().currentUser;
            const uid = user?.uid;

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", itemImage);
            formData.append("upload_preset", "quick-food-delivery");  // Replace with your actual preset
            formData.append("cloud_name", "depscilcs");        // Replace with your cloud name
            var response, data;
            try{
                console.log("sending")
                response = await fetch("https://api.cloudinary.com/v1_1/depscilcs/image/upload", {
                    method: "POST",
                    body: formData,
                });
                data = await response.json();
            }catch(e){
                console.log(e)
            }


            if (!data.secure_url) {
                throw new Error("Cloudinary upload failed");
            }

            const itemImageUrl = data.secure_url;

            const itemDetailsForDb = {
                itemTitle,
                itemIngredients,
                itemPrice,
                itemImageUrl,
                chooseItemType,
            };

            await db.collection("users").doc(uid).collection("menuItems").add(itemDetailsForDb);

            resolve("Successfully added food item");
            console.log("Success")
        } catch (error) {
            console.error("Error in addItem =>", error.message);
            reject(error.message);
        }
    });
}


function orderNow(cartItemsList, totalPrice, resDetails, userDetails, history) {
    return new Promise((resolve, reject) => {
        const user = firebase.auth().currentUser;
        if (!user) {
            return reject("User not authenticated");
        }

        const uid = user.uid;

        if (!resDetails || !resDetails.id) {
            return reject("Restaurant ID is missing. Please try again.");
        }

        const myOrder = {
            itemsList: cartItemsList,
            totalPrice: totalPrice,
            status: "PENDING",
            ...resDetails,
        };

        const orderRequest = {
            itemsList: cartItemsList,
            totalPrice: totalPrice,
            status: "PENDING",
            ...userDetails,
        };

        db.collection("users").doc(uid).collection("myOrder").add(myOrder)
            .then((docRef) => {
                return db.collection("users").doc(resDetails.id).collection("orderRequest").doc(docRef.id).set(orderRequest);
            })
            .then(() => {
                resolve("Successfully ordered");
            })
            .catch((error) => {
                console.error("Error placing order: ", error.message);
                reject(error.message);
            });
    });
}


export default firebase;
export {
    signUp,
    logIn,
    addItem,
    orderNow,
}