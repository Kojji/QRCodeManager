import { storage } from "./storage";
import { insertQRCodeSchema, insertQRCodeGroupSchema, SaveQRCodeInterface, type QRCode, QRCodeInstance, QRCodeGroupInstance, User } from "./schema";
import { z } from "zod";
import { firestore, auth } from "@/firebase"
import { collection, query, where, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore"; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export async function LoginWithEmailAndPassword (email: string, password: string) {
  return new Promise<User>(async ( res, rej ) => {
    try {
      console.log("LoginWithEmailAndPassword route found");
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential.user);
      let loggedUser = new User(
        userCredential.user.uid,
        userCredential.user.displayName ?? email.split("@")[0],
        email
      );
      res(loggedUser);
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function SendResetPassword (email: string) {
  return new Promise<void>(async ( res, rej ) => {
    try {
      console.log("SendResetPassword route found");
      await sendPasswordResetEmail(auth, email);
      res();
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function SaveNewQRCode (data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("SaveNewQRCode route found");
      const userId = "demo_user";
      const validatedData = new QRCodeInstance(data, userId);
    
      await setDoc(doc(firestore, userId, "user_data", "QRCodes", validatedData.id), {
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
      const userQRCodesQuery = query(collection(firestore, "demo_user", "user_data", "QRCodes"));
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

export async function RetrieveQRCodesByGroupId (groupId: string) {
  return new Promise<QRCodeInstance[]>(async ( res, rej ) => {
    try {
      console.log("RetrieveQRCodes route found");
      let QRCodesRetrieved : QRCodeInstance[] = [];
      const userQRCodesRef = collection(firestore, "demo_user", "user_data", "QRCodes");
      const userQRCodesQuery = query(userQRCodesRef, where("groupId", "==", groupId));
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
      const docRef = doc(firestore, userId, "user_data", "QRCodes", id);
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
      const docRef = doc(firestore, userId, "user_data", "QRCodes", id);
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
      console.log("DeleteSingleQRCode route found");
      const userId = "demo_user";
      const docRef = doc(firestore, userId, "user_data", "QRCodes", id);
      await deleteDoc(docRef);

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function SaveQRCodeGroup (data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("SaveQRCodeGroup route found");
      const userId = "demo_user";
      const validatedData = new QRCodeGroupInstance({
        ...data,
        userId
      });
      console.log(validatedData)

      await setDoc(doc(firestore, userId, "user_data", "QRCodeGroups", validatedData.id), {
        ...validatedData
      });

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function RetrieveQRCodeGroups () {
  return new Promise<QRCodeGroupInstance[]>(async ( res, rej ) => {
    try {
      console.log("RetrieveQRCodeGroups route found");
      let QRCodeGroupsRetrieved : QRCodeGroupInstance[] = [];
      const userQRCodeGroupsQuery = query(collection(firestore, "demo_user", "user_data", "QRCodeGroups"));
      const querySnapshot = await getDocs(userQRCodeGroupsQuery);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let parsedDoc = new QRCodeGroupInstance(doc.data(), doc.id);
        QRCodeGroupsRetrieved.push(parsedDoc);
      });
      res(QRCodeGroupsRetrieved);      
    } catch(err) {
      console.log(err)
      rej();
    }
  })
}

export async function RetrieveSingleQRCodeGroup (id: string) {
  return new Promise<QRCodeGroupInstance>(async ( res, rej ) => {
    try {
      console.log("RetrieveSingleQRCodeGroup");
      const QRCodeGroupDocRef = doc(firestore, "demo_user", "user_data", "QRCodeGroups", id);
      const docSnap = await getDoc(QRCodeGroupDocRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        let QRCodeGroupRetrieved = new QRCodeGroupInstance(docSnap.data());
        res(QRCodeGroupRetrieved);      
      } else {
        throw new Error("Group not found!")
      }
    } catch(err) {
      console.log(err)
      rej();
    }
  })
}

export async function EditQRCodeGroup (id: string, data: Partial<QRCodeGroupInstance>) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("EditQRCodeGroup route found");
      const userId = "demo_user";
      const docRef = doc(firestore, userId, "user_data", "QRCodeGroups", id);
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

export async function DeleteSingleQRCodeGroup (id: string) {
  return new Promise(async ( res, rej ) => {
    try {
      console.log("DeleteSingleQRCodeGroup route found");
      const userId = "demo_user";
      const docRef = doc(firestore, userId, "user_data", "QRCodeGroups", id);
      await deleteDoc(docRef);

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}
