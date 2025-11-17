import { QRCodeInstance, QRCodeGroupInstance, User } from "./schema";
import { firestore, auth } from "@/firebase"
import { collection, query, where, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, orderBy, startAfter, limit } from "firebase/firestore"; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export async function LoginWithEmailAndPassword (email: string, password: string) {
  return new Promise<User>(async ( res, rej ) => {
    try {
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      await sendPasswordResetEmail(auth, email);
      res();
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function SaveNewQRCode (userId: string, data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      const validatedData = new QRCodeInstance(data, userId);
    
      await setDoc(doc(firestore, "users", userId, "QRCodes", validatedData.id), {
        ...validatedData
      });
      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function RetrieveQRCodes (userId: string) {
  return new Promise<QRCodeInstance[]>(async ( res, rej ) => {
    try {
      let QRCodesRetrieved : QRCodeInstance[] = [];
      const userQRCodesQuery = query(collection(firestore, "users", userId, "QRCodes"), orderBy("createdAt", "desc"),  limit(6));
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

export async function LoadMoreQRCodesPagination (userId: string, lastQRCode: QRCodeInstance) {
  return new Promise<QRCodeInstance[]>(async ( res, rej ) => {
    try {
      let QRCodesRetrieved : QRCodeInstance[] = [];
      const userQRCodesQuery = query(collection(firestore, "users", userId, "QRCodes"), orderBy("createdAt", "desc"), startAfter(lastQRCode.createdAt), limit(6));
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

export async function RetrieveQRCodesByGroupId (userId: string, groupId: string) {
  return new Promise<QRCodeInstance[]>(async ( res, rej ) => {
    try {
      let QRCodesRetrieved : QRCodeInstance[] = [];
      const userQRCodesRef = collection(firestore, "users", userId, "QRCodes");
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

export async function EditSingleQRCode (userId: string, id: string, data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      const docRef = doc(firestore, "users", userId, "QRCodes", id);
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

export async function EditActivationQRCode (userId: string, id: string, data: any) {
  return new Promise(async ( res, rej ) => {
    try {
      const docRef = doc(firestore, "users", userId, "QRCodes", id);
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

export async function DeleteSingleQRCode (userId: string, id: string) {
  return new Promise(async ( res, rej ) => {
    try {
      const docRef = doc(firestore, "users", userId, "QRCodes", id);
      await deleteDoc(docRef);

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function SaveQRCodeGroup (userId: string, data: any) {
  return new Promise<void>(async ( res, rej ) => {
    try {
      const validatedData = new QRCodeGroupInstance({
        ...data,
        userId
      });

      await setDoc(doc(firestore, "users", userId, "QRCodeGroups", validatedData.id), {
        ...validatedData
      });

      res();
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function RetrieveQRCodeGroups (userId: string) {
  return new Promise<QRCodeGroupInstance[]>(async ( res, rej ) => {
    try {
      let QRCodeGroupsRetrieved : QRCodeGroupInstance[] = [];
      const userQRCodeGroupsQuery = query(collection(firestore, "users", userId, "QRCodeGroups"), orderBy("createdAt", "desc"), limit(6));
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

export async function LoadMoreQRCodeGroupsPagination (userId: string, lastQRCodeGroup: QRCodeGroupInstance) {
  return new Promise<QRCodeGroupInstance[]>(async ( res, rej ) => {
    try {
      let QRCodeGroupsRetrieved : QRCodeGroupInstance[] = [];
      const userQRCodeGroupsQuery = query(collection(firestore, "users", userId, "QRCodeGroups"), orderBy("createdAt", "desc"), startAfter(lastQRCodeGroup.createdAt), limit(6));
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

export async function RetrieveSingleQRCodeGroup (userId: string, id: string) {
  return new Promise<QRCodeGroupInstance>(async ( res, rej ) => {
    try {
      const QRCodeGroupDocRef = doc(firestore, "users", userId, "QRCodeGroups", id);
      const docSnap = await getDoc(QRCodeGroupDocRef);

      if (docSnap.exists()) {
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

export async function EditQRCodeGroup (userId: string, id: string, data: Partial<QRCodeGroupInstance>) {
  return new Promise(async ( res, rej ) => {
    try {
      const docRef = doc(firestore, "users", userId, "QRCodeGroups", id);
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

export async function DeleteSingleQRCodeGroup (userId: string, id: string) {
  return new Promise(async ( res, rej ) => {
    try {
      const docRef = doc(firestore, "users", userId, "QRCodeGroups", id);
      await deleteDoc(docRef);

      res("successo");
    } catch (err) {
      console.log(err);
      rej();
    }
  })
}

export async function RetrieveQRCodeRedirect(userId: string, shortCode: string) {
  return new Promise<string>(async ( res, rej ) => {
    try {
      let QRCodeRedirect : string = "";
      const userQRCodeRef = collection(firestore, "users", userId, "QRCodes");
      const userQRCodeQuery = query(userQRCodeRef, where("shortCode", "==", shortCode), limit(1));
      const querySnapshot = await getDocs(userQRCodeQuery);
      querySnapshot.forEach((foundDoc) => {
        // doc.data() is never undefined for query doc snapshots
        let parsedDoc = new QRCodeInstance(foundDoc.data());
        QRCodeRedirect = parsedDoc.destinationUrl;
        const docRef = doc(firestore, "users", userId, "QRCodes", parsedDoc.id);
        updateDoc(docRef, {
          scanCount: parsedDoc.scanCount + 1
        });

      });
      if(!!QRCodeRedirect) {
        res(QRCodeRedirect);
      } else {
        throw new Error("QR Code data not found")
      }
    } catch (err) {
      console.log(err);
      rej();
    }
  });
}
