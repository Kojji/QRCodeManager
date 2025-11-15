import { storage } from "./storage";
import { insertQRCodeSchema, insertQRCodeGroupSchema, SaveQRCodeInterface, type QRCode, QRCodeInstance } from "./schema";
import { z } from "zod";
import { firestore } from "@/firebase"
import { collection, query, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore"; 

export async function SaveNewQRCode (data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("SaveNewQRCode route found");
      const userId = "demo_user";
      const validatedData = new QRCodeInstance(data, userId);
    
      await setDoc(doc(firestore, userId, validatedData.id), {
        ...validatedData
      });

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function RetrieveQRCodes () {
  return new Promise<QRCodeInstance[]>(async ( res, rej ) => {
    try {
      console.log("RetrieveQRCodes route found");
      let QRCodesRetrieved : QRCodeInstance[] = [];
      const userQRCodesQuery = query(collection(firestore, "demo_user"));
      const querySnapshot = await getDocs(userQRCodesQuery);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let parsedDoc = new QRCodeInstance(doc.data());
        QRCodesRetrieved.push(parsedDoc);
      });
      res(QRCodesRetrieved);      
    } catch(err) {
      console.log(err)
      rej();
    }
  })
}

export async function EditSingleQRCode (id: string, data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("EditSingleQRCode route found");
      const userId = "demo_user";
      const docRef = doc(firestore, userId, id);
      await updateDoc(docRef, {
        ...data
      });

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function EditActivationQRCode (id: string, data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("EditActivationQRCode route found");
      const userId = "demo_user";
      const docRef = doc(firestore, userId, id);
      await updateDoc(docRef, {
        ...data
      });

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function DeleteSingleQRCode (id: string) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("EditActivationQRCode route found");
      const userId = "demo_user";
      const docRef = doc(firestore, userId, id);
      await deleteDoc(docRef);

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

// export async function RetrieveQRCode () {
//   return new Promise<QRCode[]>(async ( res, rej ) => {
//     try {
//       console.log("SaveNewQRCode route found");

//       const docRef = doc(firestore, "user_id", "read-teste");
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         console.log("Document data:", docSnap.data());
//       } else {
//         // docSnap.data() will be undefined in this case
//         console.log("No such document!");
//       }
//       res([]);      
//     } catch(err) {
//       console.log(err)
//       rej();
//     }
//   })
// }