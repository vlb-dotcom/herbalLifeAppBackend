const functions = require("firebase-functions");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");
const { query } = require("express");

// Main Application
const app = express();
app.use(
  cors({
    origin: true,
  })
);

// Main Database Reference
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Collections
const batchCollection = db.collection("batches");
const challengerCollection = db.collection("challengerDetails");
const userCollection = db.collection("users");
const quizCollection = db.collection("quizzes");
const categoryCollection = db.collection("categories");
const videosBatchCollection = db.collection("videosBatch");

const hondaModelCollection = db.collection("hondalCollection");

// ROUTES
app.get("/api/v1", (req, res) => {
  return res.status(200).send("Test GET Method HerbalLife Backend.....");
});

// HONDA -- COLLECTIONS ------------------------------------------------------
app.post("/api/v1/honda/create/car", async (req, res) => {
  try {
    let carID = "HONDA" + new Date().getTime();
    // console.log(req.body);
    await hondaModelCollection.doc(`/${carID}/`).set({
      cardID: carID,
      carName: req.body.carName,
      carDesc: req.body.carDesc,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Saved",
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// CHECK QUERY
app.get("/api/v1/honda/getQueryResult/:searchString", async (req, res) => {
  // GET ALL BATCHES
  try {
    const reqDoc = db.collection("hondalCollection");
    let inputSearchString = req.params.searchString;
    console.log("QUERY STRING: " + inputSearchString);

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        const selectedItem = {
          cardID: doc.data().cardID,
          carName: doc.data().carName,
          carDesc: doc.data().carDesc,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------

// CREATE Challenger -- POST METHOD -----------------------------------------------------------
app.post("/api/v1/create/user", async (req, res) => {
  let body = req.body;

  console.log(body);

  const firstName = body.firstName;
  const lastName = body.lastName;
  const contactNumber = body.contact;
  const email = body.email;
  const cAdmin = body.cAdmin;
  const cCoach = body.cCoach;
  const userUniqueID = body.userUniqueID;
  const profileImageLink = "Waiting";
  const password = body.password;

  var userUID;
  console.log("Creating user...");
  await admin
    .auth()
    .createUser({
      firstName: firstName,
      lastName: lastName,
      contact: contactNumber,
      email: email,
      password: password,
      cAdmin: cAdmin,
      cCoach: cCoach,
      userUniqueID: userUniqueID,
      profileImageLink: profileImageLink,
      batchAssignedTo: [
        {
          batchID: "",
        },
      ],
    })
    .then(async (userRecord) => {
      console.log("Line 77");
      console.log(userRecord);
      userUID = userRecord.uid;
      let resData = {
        status: "Success",
        data: userRecord.uid,
      };
      console.log(resData);

      let batchAssignedToData = [];
      // console.log(req.body.batchAssignedTo);
      if (req.body.batchAssignedTo === undefined) {
        console.log("no data");
      } else {
        for (let i = 0; i < req.body.batchAssignedTo.length; i++) {
          let jsonStruc = {
            batchID: req.body.batchAssignedTo[i].batchID,
          };

          batchAssignedToData.push(jsonStruc);
        }
      }

      console.log("User ID: " + userUID);
      await userCollection.doc(String(userUID)).set({
        firstName: String(firstName),
        lastName: String(lastName),
        contact: String(contactNumber),
        email: String(email),
        cAdmin: String(cAdmin),
        cCoach: String(cCoach),
        userUniqueID: String(userUID),
        profileImageLink: "Waiting",
        batchAssignedTo: String(batchAssignedToData),
      });

      return res.status(200).send(resData);
    })
    .catch((error) => {
      console.log("Error...");
      return res.status(400).send("Failed to create user: " + error);
    });
});

// CREATE Challenger -- POST METHOD -----------------------------------------------------------
app.post("/api/v1/create/challenger", async (req, res) => {
  try {
    // Used Date.now to generate a unique ID
    await challengerCollection.doc(`/${req.body.userCode}/`).set({
      id: req.body.uChatUserId,
      uChatUserId: req.body.uChatUserId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      sex: req.body.sex,

      currentQuizNum: req.body.currentQuizNum,
      currentInProgressQuiz: req.body.currentInProgressQuiz,

      emailAddress: req.body.emailAddress,
      height: req.body.height,
      weightInfo: {
        originalWeight: req.body.originalWeight,
        latestWeight: req.body.latestWeight,
        lastWeightUpdateDate: req.body.lastWeightUpdateDate,
        weightDifference: req.body.weightDifference,
      },
      groupId: req.body.groupId,
      challengeTypeId: req.body.challengeTypeId,
      coachId: req.body.coachId,
      dateStarted: req.body.dateStarted,
      groupRank: req.body.groupRank,
      groupPoints: req.body.groupPoints,
      userVerified: req.body.userVerified,
      proofOfBillingLink: req.body.proofOfBillingLink,
      selfieLink: req.body.selfieLink,
      weightProofLink: req.body.weightProofLink,

      firstWeighIn: req.body.firstWeighIn,
      firstWeighInImageProofLink: req.body.firstWeighInImageProofLink,
      secondWeighIn: req.body.secondWeighIn,
      secondWeighInImageProofLink: req.body.secondWeighInImageProofLink,

      firstQuizScore: req.body.firstQuizScore,
      secondQuizScore: req.body.secondQuizScore,

      weighInWeightProof: req.body.weighInWeightProof,
      beforeBodyPicture: req.body.beforeBodyPicture,
      afterBodyPicture: req.body.afterBodyPicture,
      userCode: req.body.userCode,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Saved",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// CREATE Batches -- POST METHOD -----------------------------------------------------------
app.post("/api/v1/create/batch", async (req, res) => {
  try {
    let batchChallengerData = [];

    if (req.body.batchChallengers === undefined) {
      console.log("no data");
    } else {
      for (let i = 0; i < req.body.batchChallengers.length; i++) {
        console.log(req.body.batchChallengers[i]);
      }
    }

    // console.log(req.body);
    await batchCollection.doc(`/${req.body.id}/`).set({
      id: req.body.id,
      batchName: req.body.batchName,
      batchStatusState: req.body.batchStatusState,
      batchChallengeType: req.body.batchChallengeType,
      batchCreatedDate: req.body.batchCreatedDate,
      batchStartDate: req.body.batchStartDate,
      batchEndDate: req.body.batchEndDate,
      batchStartRunTime: req.body.batchStartRunTime,
      batchCreator: req.body.batchCreator,
      batchImageLink: req.body.batchImageLink,
      batchAssignedCoach: req.body.batchAssignedCoach,
      batchAssignedBatchVid: req.body.batchAssignedBatchVid,
      batchAssignedQuiz: req.body.batchAssignedQuiz,
      batchAssignedQuizB: req.body.batchAssignedQuizB,
      batchTotalChallengers: req.body.batchTotalChallengers,

      batchChallengers: [],
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Saved",
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// CREATE -- QUIZ ------------------------------------------------------
app.post("/api/v1/create/quiz", async (req, res) => {
  try {
    // console.log(req.body);
    await quizCollection.doc(`/${req.body.quizID}/`).set({
      quizID: req.body.quizID,
      quizName: req.body.quizName,
      quizPointsPerQuestion: req.body.quizPointsPerQuestion,
      quizStatus: req.body.quizStatus,
      quizQuestions: req.body.quizQuestions,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Saved",
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// CREATE -- Videos Batch ------------------------------------------------------
app.post("/api/v1/create/videosBatch", async (req, res) => {
  try {
    // console.log(req.body);
    await videosBatchCollection.doc(`/${req.body.batchVidID}/`).set({
      batchVidID: req.body.batchVidID,
      batchVidName: req.body.batchVidName,
      batchVideosData: req.body.batchVideosData,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Saved",
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// CREATE -- Category ------------------------------------------------------
app.post("/api/v1/create/category", async (req, res) => {
  try {
    // console.log(req.body);
    await categoryCollection.doc(`/${req.body.categoryID}/`).set({
      categoryID: req.body.categoryID,
      categoryName: req.body.categoryName,
      categoryLink: req.body.categoryLink,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Saved",
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// GET -- GET METHOD -----------------------------------------------------------

app.get("/api/v1/categories", async (req, res) => {
  // GET ALL CATEGORIES
  try {
    const reqDoc = db.collection("categories");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      // console.log(docs)

      docs.map((doc) => {
        const selectedItem = {
          categoryID: doc.data().categoryID,
          categoryName: doc.data().categoryName,
          categoryLink: doc.data().categoryLink,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/quizzes", async (req, res) => {
  // GET ALL Quizzes
  try {
    const reqDoc = db.collection("quizzes");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      // console.log(docs)

      docs.map((doc) => {
        const selectedItem = {
          quizID: doc.data().quizID,
          quizName: doc.data().quizName,
          quizPointsPerQuestion: doc.data().quizPointsPerQuestion,
          quizStatus: doc.data().quizStatus,
          quizQuestions: doc.data().quizQuestions,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/users", async (req, res) => {
  // GET ALL USERS
  try {
    const reqDoc = db.collection("users");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      // console.log(docs)

      docs.map((doc) => {
        const selectedItem = {
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          contact: doc.data().contact,
          email: doc.data().email,
          cAdmin: doc.data().cAdmin,
          cCoach: doc.data().cCoach,
          userUniqueID: doc.data().userUniqueID,
          profileImageLink: doc.data().profileImageLink,
          batchAssignedTo: doc.data().batchAssignedTo,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/challengers", async (req, res) => {
  // GET ALL CHALLENGERS
  try {
    const reqDoc = db.collection("challengerDetails");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        console.log(doc);
        const selectedItem = {
          id: doc.data().id,
          uChatUserId: doc.data().uChatUserId,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          emailAddress: doc.data().emailAddress,
          age: doc.data().age,
          sex: doc.data().sex,

          currentQuizNum: doc.data().currentQuizNum,
          currentInProgressQuiz: doc.data().currentInProgressQuiz,

          height: doc.data().height,
          weightInfo: doc.data().weightInfo,
          originalWeight: doc.data().originalWeight,
          latestWeight: doc.data().latestWeight,
          lastWeightUpdateDate: doc.data().lastWeightUpdateDate,
          weightDifference: doc.data().weightDifference,
          groupId: doc.data().groupId,
          challengeTypeId: doc.data().challengeTypeId,
          coachId: doc.data().coachId,
          dateStarted: doc.data().dateStarted,
          groupRank: doc.data().groupRank,
          groupPoints: doc.data().groupPoints,
          userVerified: doc.data().userVerified,
          proofOfBillingLink: doc.data().proofOfBillingLink,
          userCode: doc.data().userCode,
          selfieLink: doc.data().selfieLink,
          weightProofLink: doc.data().weightProofLink,
          firstWeighIn: doc.data().firstWeighIn,
          firstWeighInImageProofLink: doc.data().firstWeighInImageProofLink,
          secondWeighIn: doc.data().secondWeighIn,
          secondWeighInImageProofLink: doc.data().secondWeighInImageProofLink,
          firstQuizScore: doc.data().firstQuizScore,
          secondQuizScore: doc.data().secondQuizScore,
          weighInWeightProof: doc.data().weighInWeightProof,
          beforeBodyPicture: doc.data().beforeBodyPicture,
          afterBodyPicture: doc.data().afterBodyPicture,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v2/challengers", async (req, res) => {
  // GET ALL CHALLENGERS
  try {
    const reqDoc = db.collection("challengerDetails");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        console.log(doc);
        const selectedItem = {
          id: doc.data().id,
          uChatUserId: doc.data().uChatUserId,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          emailAddress: doc.data().emailAddress,
          age: doc.data().age,
          sex: doc.data().sex,

          currentQuizNum: doc.data().currentQuizNum,
          currentInProgressQuiz: doc.data().currentInProgressQuiz,

          height: doc.data().height,

          //weightInfo: doc.data().weightInfo,

          originalWeight: doc.data().weightInfo.originalWeight,
          latestWeight: doc.data().weightInfo.latestWeight,
          lastWeightUpdateDate: doc.data().weightInfo.lastWeightUpdateDate,
          weightDifference: doc.data().weightInfo.weightDifference,

          groupId: doc.data().groupId,
          challengeTypeId: doc.data().challengeTypeId,
          coachId: doc.data().coachId,
          dateStarted: doc.data().dateStarted,
          groupRank: doc.data().groupRank,
          groupPoints: doc.data().groupPoints,
          userVerified: doc.data().userVerified,
          proofOfBillingLink: doc.data().proofOfBillingLink,
          userCode: doc.data().userCode,
          selfieLink: doc.data().selfieLink,
          weightProofLink: doc.data().weightProofLink,
          firstWeighIn: doc.data().firstWeighIn,
          firstWeighInImageProofLink: doc.data().firstWeighInImageProofLink,
          secondWeighIn: doc.data().secondWeighIn,
          secondWeighInImageProofLink: doc.data().secondWeighInImageProofLink,
          firstQuizScore: doc.data().firstQuizScore,
          secondQuizScore: doc.data().secondQuizScore,
          weighInWeightProof: doc.data().weighInWeightProof,
          beforeBodyPicture: doc.data().beforeBodyPicture,
          afterBodyPicture: doc.data().afterBodyPicture,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/batch/challengers/:batchID", async (req, res) => {
  // GET ALL CHALLENGERS BY BATCH ID
  try {
    const reqDoc = db.collection("challengerDetails");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        const selectedItem = {
          id: doc.data().id,
          uChatUserId: doc.data().uChatUserId,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,

          currentQuizNum: doc.data().currentQuizNum,
          currentInProgressQuiz: doc.data().currentInProgressQuiz,

          emailAddress: doc.data().emailAddress,
          age: doc.data().age,
          sex: doc.data().sex,
          height: doc.data().height,
          weightInfo: doc.data().weightInfo,
          originalWeight: doc.data().originalWeight,
          latestWeight: doc.data().latestWeight,
          lastWeightUpdateDate: doc.data().lastWeightUpdateDate,
          weightDifference: doc.data().weightDifference,
          groupId: doc.data().groupId,
          challengeTypeId: doc.data().challengeTypeId,
          coachId: doc.data().coachId,
          dateStarted: doc.data().dateStarted,
          groupRank: doc.data().groupRank,
          groupPoints: doc.data().groupPoints,
          userVerified: doc.data().userVerified,
          proofOfBillingLink: doc.data().proofOfBillingLink,
          userCode: doc.data().userCode,
          selfieLink: doc.data().selfieLink,
          weightProofLink: doc.data().weightProofLink,
          firstWeighIn: doc.data().firstWeighIn,
          firstWeighInImageProofLink: doc.data().firstWeighInImageProofLink,
          secondWeighIn: doc.data().secondWeighIn,
          secondWeighInImageProofLink: doc.data().secondWeighInImageProofLink,
          firstQuizScore: doc.data().firstQuizScore,
          secondQuizScore: doc.data().secondQuizScore,
          weighInWeightProof: doc.data().weighInWeightProof,
          beforeBodyPicture: doc.data().beforeBodyPicture,
          afterBodyPicture: doc.data().afterBodyPicture,
        };

        if (selectedItem.groupId === req.params.batchID) {
          response.push(selectedItem);
        }
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/batches", async (req, res) => {
  // GET ALL BATCHES
  try {
    const reqDoc = db.collection("batches");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        const selectedItem = {
          id: doc.data().id,
          batchName: doc.data().batchName,
          batchChallengeType: doc.data().batchChallengeType,
          batchStatusState: doc.data().batchStatusState,
          batchCreatedDate: doc.data().batchCreatedDate,
          batchCreator: doc.data().batchCreator,
          batchImageLink: doc.data().batchImageLink,
          batchStartDate: doc.data().batchStartDate,
          batchEndDate: doc.data().batchEndDate,
          batchStartRunTime: doc.data().batchStartRunTime,
          batchAssignedCoach: doc.data().batchAssignedCoach,
          batchAssignedBatchVid: doc.data().batchAssignedBatchVid,
          batchAssignedQuiz: doc.data().batchAssignedQuiz,
          batchAssignedQuizB: doc.data().batchAssignedQuizB,
          batchTotalChallengers: doc.data().batchTotalChallengers,
          batchChallengers: doc.data().batchChallengers,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/videosBatch", async (req, res) => {
  // GET ALL BATCHES
  try {
    const reqDoc = db.collection("videosBatch");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        const selectedItem = {
          batchVidName: doc.data().batchVidName,
          batchVidID: doc.data().batchVidID,
          batchVideosData: doc.data().batchVideosData,
        };

        response.push(selectedItem);
      });
      return response;
    });

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// GET BATCH BY CATEGORIES
app.get("/api/v1/batches/byCategory/:categoryID", async (req, res) => {
  // GET ALL BATCHES
  try {
    const reqDoc = db.collection("batches");

    let response = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        const selectedItem = {
          id: doc.data().id,
          batchName: doc.data().batchName,
          batchChallengeType: doc.data().batchChallengeType,
          batchStatusState: doc.data().batchStatusState,
          batchCreatedDate: doc.data().batchCreatedDate,
          batchCreator: doc.data().batchCreator,
          batchImageLink: doc.data().batchImageLink,
          batchStartDate: doc.data().batchStartDate,
          batchEndDate: doc.data().batchEndDate,
          batchStartRunTime: doc.data().batchStartRunTime,
          batchAssignedCoach: doc.data().batchAssignedCoach,
          batchAssignedBatchVid: doc.data().batchAssignedBatchVid,
          batchAssignedQuiz: doc.data().batchAssignedQuiz,
          batchAssignedQuizB: doc.data().batchAssignedQuizB,
          batchTotalChallengers: doc.data().batchTotalChallengers,
          batchChallengers: doc.data().batchChallengers,
        };

        let categoryID = req.params.categoryID;
        if (categoryID.includes(selectedItem.batchChallengeType)) {
          response.push(selectedItem);
        }
      });
      return response;
    });
    console.log("Batch by Categories length: " + response.length);
    if (response.length < 1) {
      response = "No data found.";
    }

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// ---------------------------- GET BY ID ----------------------

app.get("/api/v1/quiz/:quizID", async (req, res) => {
  // GET Quiz by Quiz ID
  try {
    const reqDoc = db.collection("quizzes").doc(req.params.quizID);

    let quizData = await reqDoc.get();
    let response = quizData.data();

    console.log(response);
    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/category/:categoryID", async (req, res) => {
  // GET CATEGORIES by User ID
  try {
    const reqDoc = db.collection("categories").doc(req.params.categoryID);

    let categoriesData = await reqDoc.get();
    let response = categoriesData.data();

    console.log(response);
    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// categories

// GET USER BY ID
app.get("/api/v1/user/:userCode", async (req, res) => {
  // GET User by uID
  try {
    const reqDoc = db.collection("users").doc(req.params.userCode);

    let challengerData = await reqDoc.get();
    let response = challengerData.data();

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/challenger/:userCode", async (req, res) => {
  // GET CHALLENGER by User ID
  try {
    const reqDoc = db.collection("challengerDetails").doc(req.params.userCode);

    let challengerData = await reqDoc.get();
    let response = challengerData.data();
    let stateValue = true;

    console.log(response);
    if (response === null || response === undefined) {
      response = "Cannot find challenger.";
      stateValue = false;
    }

    return res.status(200).send({
      status: "Success",
      data: response,
      state: stateValue,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/batch/:id", async (req, res) => {
  // GET BATCH by Batch ID
  try {
    const reqDoc = db.collection("batches").doc(req.params.id);

    let batchData = await reqDoc.get();
    let response = batchData.data();

    if (response == null || response == undefined) {
      response = "No batch found!";
    } else {
      response = response;
    }

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

app.get("/api/v1/videosBatch/:id", async (req, res) => {
  // GET BATCH by Batch Video ID
  try {
    const reqDoc = db.collection("videosBatch").doc(req.params.id);

    let batchData = await reqDoc.get();
    let response = batchData.data();

    if (response == null || response == undefined) {
      response = "No batch found!";
    } else {
      response = response;
    }

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Get Wellness Video for current day BY Batch ID
app.get("/api/v1/wellnessVideo/getVideo/:batchID", async (req, res) => {
  // Get Wellness Video for current day BY Batch ID
  try {
    const reqDoc = db.collection("videosBatch").doc(req.params.id);

    let batchData = await reqDoc.get();
    let response = batchData.data();

    if (response == null || response == undefined) {
      response = "No batch found!";
    } else {
      response = response;
    }

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Get Wellness Video for current day BY Batch ID
app.get(
  "/api/v1/wellnessVideo/getSpecificVideoData/:batchID/:videoID",
  async (req, res) => {
    // Get Wellness Video Specific for current day BY Batch ID
    try {
      const reqDoc = db.collection("videosBatch").doc(req.params.batchID);

      let batchData = await reqDoc.get();
      let response = batchData.data();

      if (response == null || response == undefined) {
        response = "No batch found!";
      } else {
        response = response;

        let videoID = req.params.videoID;

        let batchVideos = response.batchVideosData;
        for (let i = 0; i < batchVideos.length; i++) {
          // console.log(batchVideos[i]);
          if (batchVideos[i].videoID == videoID) {
            console.log(batchVideos[i]);
            response = batchVideos[i];
          }
        }
      }

      return res.status(200).send({
        status: "Success",
        data: response,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        status: "Failed",
        msg: err,
      });
    }
  }
);

// UPDATE -- PUT METHOD -----------------------------------------------------------

app.put("/api/v1/update/challenger/:id", async (req, res) => {
  try {
    // Update user by uChat id or userId
    const reqDoc = db.collection("challengerDetails").doc(req.params.id);

    await reqDoc.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      currentQuizNum: req.body.currentQuizNum,
      currentInProgressQuiz: req.body.currentInProgressQuiz,
      age: req.body.age,
      sex: req.body.sex,
      height: req.body.height,
      weightInfo: {
        originalWeight: req.body.originalWeight,
        latestWeight: req.body.latestWeight,
        lastWeightUpdateDate: req.body.lastWeightUpdateDate,
        weightDifference: req.body.weightDifference,
      },
      groupId: req.body.groupId,
      challengeTypeId: req.body.challengeTypeId,
      coachId: req.body.coachId,
      dateStarted: req.body.dateStarted,
      groupRank: req.body.groupRank,
      groupPoints: req.body.groupPoints,
      userVerified: req.body.userVerified,
      proofOfBillingLink: req.body.proofOfBillingLink,
      userCode: req.body.userCode,
      selfieLink: req.body.selfieLink,
      weightProofLink: req.body.weightProofLink,
      firstWeighIn: req.body.firstWeighIn,
      firstWeighInImageProofLink: req.body.firstWeighInImageProofLink,
      secondWeighIn: req.body.secondWeighIn,
      secondWeighInImageProofLink: req.body.secondWeighInImageProofLink,
      firstQuizScore: req.body.firstQuizScore,
      secondQuizScore: req.body.secondQuizScore,
      weighInWeightProof: req.body.weighInWeightProof,
      beforeBodyPicture: req.body.beforeBodyPicture,
      afterBodyPicture: req.body.afterBodyPicture,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Updated",
      data: reqDoc,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// Update USER Data
app.put("/api/v1/update/user/:id", async (req, res) => {
  try {
    // Update user by uChat id or userId
    const reqDoc = db.collection("users").doc(req.params.id);

    await reqDoc.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      contact: req.body.contact,
      email: req.body.email,
      cAdmin: req.body.cAdmin,
      cCoach: req.body.cCoach,
      userUniqueID: req.body.userUniqueID,
      profileImageLink: req.body.profileImageLink,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Updated",
      data: reqDoc,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// Update BATCH Data
app.put("/api/v1/update/batch/:id", async (req, res) => {
  try {
    // Update batch by id
    const reqDoc = db.collection("batches").doc(req.params.id);

    let batchChallengerData = [];
    for (let i = 0; i < req.body.batchChallengers.length; i++) {
      let jsonStruc = {
        challengerID: req.body.batchChallengers[i].challengerID,
        rankPoints: req.body.batchChallengers[i].rankPoints,
      };

      batchChallengerData.push(jsonStruc);
    }

    await reqDoc.update({
      id: req.body.id,
      batchName: req.body.batchName,
      batchChallengeType: req.body.batchChallengeType,
      batchStatusState: req.body.batchStatusState,
      batchCreatedDate: req.body.batchCreatedDate,
      batchStartDate: req.body.batchStartDate,
      batchEndDate: req.body.batchEndDate,
      batchStartRunTime: req.body.batchStartRunTime,
      batchCreator: req.body.batchCreator,
      batchImageLink: req.body.batchImageLink,
      batchAssignedCoach: req.body.batchAssignedCoach,
      batchAssignedBatchVid: req.body.batchAssignedBatchVid,
      batchAssignedQuiz: req.body.batchAssignedQuiz,
      batchAssignedQuizB: req.body.batchAssignedQuizB,
      batchTotalChallengers: req.body.batchTotalChallengers,
      batchChallengers: batchChallengerData,
    });

    return res.status(200).send({
      status: "Success",
      msg: "Data Updated",
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// DELETE -- DELETE METHOD
app.delete("/api/v1/delete/batch/:id", async (req, res) => {
  // DELETE MARATHON BATCH
  try {
    const reqDoc = db.collection("batches").doc(req.params.id);
    await reqDoc.delete();

    return res.status(200).send({
      status: "Success",
      msg: `Batch with ID ${req.params.id} has been removed!`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

// DELETE Challenger
app.delete("/api/v1/delete/challenger/:id", async (req, res) => {
  // DELETE Challenger
  try {
    const reqDoc = db.collection("challengerDetails").doc(req.params.id);
    await reqDoc.delete();

    return res.status(200).send({
      status: "Success",
      msg: `Challenger with ID ${req.params.id} has been deleted!`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

app.delete("/api/v1/delete/videosBatch/:id", async (req, res) => {
  // DELETE VIDEO BATCH
  try {
    const reqDoc = db.collection("videosBatch").doc(req.params.id);
    await reqDoc.delete();

    return res.status(200).send({
      status: "Success",
      msg: `Batch Video with ID ${req.params.id} has been deleted!`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});

app.delete("/api/v1/delete/quiz/:id", async (req, res) => {
  // DELETE VIDEO BATCH
  try {
    const reqDoc = db.collection("quizzes").doc(req.params.id);
    await reqDoc.delete();

    return res.status(200).send({
      status: "Success",
      msg: `Quiz with ID ${req.params.id} has been deleted!`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Failed",
      msg: error,
    });
  }
});
// const batchCollection = db.collection("batches");
// const challengerCollection = db.collection("challengerDetails");
// const userCollection = db.collection("users");
// const quizCollection = db.collection("quizzes");
// const videosBatchCollection = db.collection("videosBatch");

// --------------------------------------------------------------------- API FOR CHATBOT RENDERING --------------------

// Get Wellness Video for current day BY Batch ID
app.get("/api/v1/uchat/getCurrentWellnessVideo/:userID", async (req, res) => {
  // Get Wellness Video for current day BY Batch ID
  try {
    const reqDoc = db.collection("challengerDetails").doc(req.params.userID);
    // GET BATCH DATA BY USER ID
    let challengerData = await reqDoc.get();
    let challengerRes = challengerData.data();
    let stateValue = true;
    let videoLink = "";
    // console.log(challengerRes)
    if (challengerRes === null || challengerRes === undefined) {
      console.log("Canoto find challenger...");
      response = "Cannot find challenger.";
      stateValue = false;

      return res.status(200).send({
        status: "Success",
        data: "Unassigned",
      });
    } else {
      console.log("CHALLENGER BATCH ID: ");
      console.log(challengerRes.groupId);
      let batcHID = challengerRes.groupId;

      const reqDoc = db.collection("batches").doc(batcHID);

      let batchData = await reqDoc.get();
      let batchDataRes = batchData.data();

      if (batchDataRes == null || batchDataRes == undefined) {
        batchDataRes = "No batch found!";
      } else {
        // GET WELLNESS VIDEO DATA BY WELLNESS ID
        console.log("WELLNESS VIDEO ID: ");
        console.log(batchDataRes.batchAssignedBatchVid);
        let wellnessVideoID = batchDataRes.batchAssignedBatchVid;
        let startDateData = batchDataRes.batchStartDate;

        if (wellnessVideoID != "Waiting") {
          const reqDoc = db.collection("videosBatch").doc(wellnessVideoID);

          let batchData = await reqDoc.get();
          let videosBatchRes = batchData.data();
          // console.log(videosBatchRes)
          let videoDaysArr = videosBatchRes.batchVideosData;
          if (videosBatchRes == null || videosBatchRes == undefined) {
            videosBatchRes = "No batch found!";
          } else {
            console.log("BATCH START DATE: " + startDateData);

            let diffDays = getDayDiff(startDateData);
            console.log(diffDays + " days");

            let notWellnessVidDays = [0, 1, 5, 10, 7, 15];
            // let daysAvail = [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14]

            if (notWellnessVidDays.includes(diffDays)) {
              console.log("NOT WELLNESS VIDEO DAY!");
              videoLink = "Invalid Date";

              return res.status(200).send({
                status: "Success",
                data: videoLink,
              });
            } else {
              console.log("WELLNESS VIDEO DAY!");
              videoDaysArr.map((vidDay) => {
                if (vidDay.day === diffDays) {
                  console.log("FOUND VIDEO LINK..");
                  videoLink = vidDay.videoLink;

                  return res.status(200).send({
                    status: "Success",
                    data: videoLink,
                  });
                }
              });
            }
          }
        }
      }
    }

    return res.status(200).send({
      status: "Success",
      data: videoLink,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

function getDayDiff(startDateData) {
  // Asia/Manila

  console.log("MOMENT:");
  // var time = moment(new Date().toLocaleTimeString()).utc();
  let currentPHDate = moment.tz(moment(), "Asia/Manila").format("MM/DD/YYYY");
  // console.log(moment(time, startDate).fromNow());

  // const date1 = new Date("7/13/2010");
  console.log(currentPHDate);
  const date1 = new Date(currentPHDate);
  const date2 = new Date(startDateData);
  const diffTime = Math.abs(date2 - date1);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  diffDays = diffDays + 1;
  console.log(diffTime + " milliseconds");
  console.log(diffDays + " days");
  console.log("DIFF DAYS: " + diffDays);
  return diffDays;
}

function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return newDate;
}

// GET TODAY's QUIZ
app.get("/api/v1/uchat/getCurrentQuiz/:userID", async (req, res) => {
  // Get Quiz for current day BY Batch ID
  try {
    const reqDoc = db.collection("challengerDetails").doc(req.params.userID);
    // GET BATCH DATA BY USER ID
    let challengerData = await reqDoc.get();
    let challengerRes = challengerData.data();
    let stateValue = true;
    let quizData = "";
    let quizComState = "NA";
    let currQuiz = "";
    // console.log(challengerRes)
    if (challengerRes === null || challengerRes === undefined) {
      response = "Cannot find challenger.";
      stateValue = false;
    } else {
      console.log("CHALLENGER BATCH ID: ");
      console.log(challengerRes.groupId);
      let batcHID = challengerRes.groupId;

      let ch_CurrentQuiz = challengerRes.currentInProgressQuiz;
      let ch_CurrentQuizNum = challengerRes.currentQuizNum;

      const reqDoc = db.collection("batches").doc(batcHID);

      let batchData = await reqDoc.get();
      let batchDataRes = batchData.data();

      if (batchDataRes == null || batchDataRes == undefined) {
        console.log("Batch No Data Found!");
        batchDataRes = "No batch found!";
        quizComState = "NA";
      } else {
        let startDateData = batchDataRes.batchStartDate;
        // GET QUIZ DATA BY QUIZ ID
        console.log("Batch Data Res");
        console.log(batchDataRes);

        console.log("BATCH START DATE: " + startDateData);

        var daysDiff = getDayDiff(startDateData);

        let quizDays = [5, 10];

        let checkQuizChallengerState = "";
        console.log("Current Quiz: ");
        console.log(ch_CurrentQuiz);
        // VALIDATE IF FIRST QUIZ OR SECOND QUIZ
        if (ch_CurrentQuiz == "firstQuiz" || ch_CurrentQuiz == "firstDay") {
          console.log("First Quiz...");
          checkQuizChallengerState = "1st";
          currQuiz = "firstQuiz";
        } else {
          console.log("Second Quiz....");
          checkQuizChallengerState = "2nd";
          currQuiz = "secondQuiz";
        }

        if (quizDays.includes(daysDiff)) {
          if (daysDiff == 5) {
            console.log("1st Quiz Day");
          } else {
            console.log("2nd Quiz Day");
            if (checkQuizChallengerState != "2nd") {
              // Update user by uChat id or userId to second quiz
              const reqDoc = db
                .collection("challengerDetails")
                .doc(req.params.userID);
              const reqDocChData = db
                .collection("challengerDetails")
                .doc(req.params.userID);

              let challengerData = await reqDocChData.get();
              let resChData = challengerData.data();
              console.log(resChData);

              await reqDoc.update({
                currentInProgressQuiz: "secondQuiz",
                currentQuizNum: 0,
              });

              ch_CurrentQuizNum = 0;
            }
          }
        }

        if (quizDays.includes(daysDiff)) {
          console.log("QUIZ DAY!");
          if (daysDiff == 5) {
            console.log("1st Quiz Day");
            let firstQuizID = batchDataRes.batchAssignedQuiz;
            console.log("FIRST DAY QUIZ ID: " + firstQuizID);
            const reqDocA = db.collection("quizzes").doc(firstQuizID);

            let quizData = await reqDocA.get();
            let quizInfo = quizData.data();
            if (quizInfo != null || quizInfo != undefined) {
              console.log("1st DAY | QUIZ INFO");
              console.log(quizInfo);
              // console.log(ch_CurrentQuiz)
              console.log("Challenger Num: " + ch_CurrentQuizNum);

              let numOfQuestions = quizInfo.quizQuestions.length;
              console.log("1st QUIZ | Num Questions: " + numOfQuestions);
              if (numOfQuestions == ch_CurrentQuizNum) {
                console.log("Completed the quiz!");
                quizComState = "Complete";
              } else {
                console.log("InComplete quiz!");
                quizComState = "Incomplete";

                let quizPoints = quizInfo.quizPointsPerQuestion;
                let questionDataA = quizInfo.quizQuestions[ch_CurrentQuizNum];
                console.log("1st QUIZ | QUESTION DATA");
                console.log(questionDataA);

                let corrAnswer = questionDataA.quizCorrectAnswer;
                let inCorrAnsJson = {
                  choice: corrAnswer,
                };

                let availChoices =
                  questionDataA.quizIncorrectAnswer.push(inCorrAnsJson);

                let shuffledChoices = shuffle(
                  questionDataA.quizIncorrectAnswer
                );
                console.log("SHUFFLED CHOICES");
                console.log(shuffledChoices);

                questionDataA.quizIncorrectAnswer = shuffledChoices;

                let quizResponseDataA = {
                  points: quizPoints,
                  questionData: questionDataA,
                };

                quizData = quizResponseDataA;

                console.log("QUIZ DATA: ");
                console.log(quizData);

                quizComState = "Incomplete";

                return res.status(200).send({
                  status: "Success",
                  currentQuiz: "firstDay",
                  quizCompletionStatus: quizComState,
                  data: quizData,
                });
              }
            } else {
              quizData = "No data";
              quizComState = "NA";
            }
          } else {
            console.log("2nd Quiz Day");
            let secondQuizID = batchDataRes.batchAssignedQuizB;

            const reqDocB = db.collection("quizzes").doc(secondQuizID);

            let quizDataB = await reqDocB.get();
            let quizInfoB = quizDataB.data();
            if (quizInfoB != null || quizInfoB != undefined) {
              // quizData = quizInfoB
              // console.log(quizInfoB);
              // console.log(ch_CurrentQuiz)
              // console.log(ch_CurrentQuizNum + 1)

              let numOfQuestions = quizInfoB.quizQuestions.length;
              console.log(numOfQuestions);
              if (numOfQuestions == ch_CurrentQuizNum) {
                console.log("Completed the quiz!");
                quizComState = "Complete";
              } else {
                console.log("InComplete quiz!");
                quizComState = "Incomplete";

                let quizPoints = quizInfoB.quizPointsPerQuestion;
                let questionData = quizInfoB.quizQuestions[ch_CurrentQuizNum];
                console.log(questionData);

                let corrAnswer = questionData.quizCorrectAnswer;
                let inCorrAnsJson = {
                  choice: corrAnswer,
                };

                let availChoices =
                  questionData.quizIncorrectAnswer.push(inCorrAnsJson);
                console.log(availChoices);

                let shuffledChoices = shuffle(questionData.quizIncorrectAnswer);
                console.log("SHUFFLED CHOICES");
                console.log(shuffledChoices);

                questionData.quizIncorrectAnswer = shuffledChoices;

                let quizResponseData = {
                  points: quizPoints,
                  questionData: questionData,
                };

                quizData = quizResponseData;

                quizComState = "Incomplete";

                return res.status(200).send({
                  status: "Success",
                  currentQuiz: "secondDay",
                  quizCompletionStatus: quizComState,
                  data: quizData,
                });
              }
            } else {
              quizData = "No data";
              quizComState = "NA";
            }
          }
        } else {
          console.log("Not Quiz Day");
          quizComState = "Incomplete";
          quizData = "Invalid Date";
        }
      }

      console.log("QUIZ DATA: ");
      console.log(quizData);
    }

    console.log("QUIZ DATA: ");
    console.log(quizData);

    return res.status(200).send({
      status: "Success",
      currentQuiz: currQuiz,
      quizCompletionStatus: quizComState,
      data: quizData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// Update user by uChat id or userId after answering the quiz question
app.put(
  "/api/v1/update/uchat/quiz/challenger/:id/:points/:quizPhase",
  async (req, res) => {
    try {
      // Update user by uChat id or userId after answering the quiz question
      const reqDoc = db.collection("challengerDetails").doc(req.params.id);
      let userPoints = req.params.points;
      let quizPhase = req.params.quizPhase;
      console.log("QUIZ PHASE: " + quizPhase);
      const reqDocChData = db
        .collection("challengerDetails")
        .doc(req.params.id);

      let challengerData = await reqDocChData.get();
      let resChData = challengerData.data();
      // console.log(resChData)

      let newPoints = parseInt(resChData.groupPoints) + parseInt(userPoints);
      console.log("New Points: " + newPoints);

      if (quizPhase == "firstQuiz" || quizPhase == "firstDay") {
        console.log("FIrst QUIZ");
        await reqDoc.update({
          currentQuizNum: parseInt(resChData.currentQuizNum) + 1,
          groupPoints: newPoints,
          firstQuizScore:
            resChData.firstQuizScore == "Waiting"
              ? parseInt(userPoints)
              : parseInt(resChData.firstQuizScore) + parseInt(userPoints),
        });
      } else {
        console.log("Second QUIZ");
        await reqDoc.update({
          currentQuizNum: parseInt(resChData.currentQuizNum) + 1,
          groupPoints: newPoints,
          secondQuizScore:
            resChData.secondQuizScore == "Waiting"
              ? parseInt(userPoints)
              : parseInt(resChData.secondQuizScore) + parseInt(userPoints),
        });
      }

      return res.status(200).send({
        status: "Success",
        msg: "Data Updated",
        data: reqDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: "Failed",
        msg: error,
      });
    }
  }
);

// UPLOAD WEIGH IN Proof
app.get("/api/v1/uchat/getCurrentPhase/:userID", async (req, res) => {
  try {
    const reqDoc = db.collection("challengerDetails").doc(req.params.userID);
    // GET BATCH DATA BY USER ID
    let challengerData = await reqDoc.get();
    let challengerRes = challengerData.data();
    let stateValue = true;
    let quizData = "";
    let quizComState = "NA";
    let currQuiz = "";
    let stateUpload;
    // console.log(challengerRes)
    if (challengerRes === null || challengerRes === undefined) {
      console.log("Cannot Find Challenger.");
      response = "Cannot find challenger.";
      stateValue = false;
    } else {
      console.log("CHALLENGER BATCH ID: ");
      console.log(challengerRes.groupId);
      let batcHID = challengerRes.groupId;

      let ch_CurrentQuiz = challengerRes.currentInProgressQuiz;
      let ch_CurrentQuizNum = challengerRes.currentQuizNum;

      const reqDoc = db.collection("batches").doc(batcHID);

      let batchData = await reqDoc.get();
      let batchDataRes = batchData.data();
      let startDateData = batchDataRes.batchStartDate;

      if (batchDataRes == null || batchDataRes == undefined) {
        batchDataRes = "No batch found!";
        quizComState = "NA";
        console.log("No Batch Found.");
      } else {
        // GET QUIZ DATA BY QUIZ ID

        console.log("BATCH START DATE: " + startDateData);
        // var startDate = new Date(startDateData);

        var daysDiff = getDayDiff(startDateData);

        let quizDays = [7, 15];

        if (quizDays.includes(daysDiff)) {
          if (daysDiff == 7) {
            console.log("1st Quiz Day");
            const reqDocChData = db
              .collection("challengerDetails")
              .doc(req.params.userID);
            let challengerData = await reqDocChData.get();
            let resChData = challengerData.data();

            console.log(
              "Current First Day Image Link: " +
                resChData.firstWeighInImageProofLink
            );

            stateUpload =
              resChData.firstWeighInImageProofLink != "Waiting"
                ? "Completed"
                : "Incomplete";

            currProgress =
              resChData.firstWeighInImageProofLink != "Waiting"
                ? "firstQuiz"
                : "firstQuiz";

            currQuiz = currProgress;
            return res.status(200).send({
              status: "Success",
              currentQuiz: currProgress,
              statusUpload: stateUpload,
            });
          } else if (daysDiff == 15) {
            console.log("2nd Quiz Day");
            // if(checkQuizChallengerState == '2nd') {
            // Update user by uChat id or userId to second quiz
            const reqDoc = db
              .collection("challengerDetails")
              .doc(req.params.userID);
            const reqDocChData = db
              .collection("challengerDetails")
              .doc(req.params.userID);

            let challengerData = await reqDocChData.get();
            let resChData = challengerData.data();

            stateUpload =
              resChData.secondWeighInImageProofLink != "Waiting"
                ? "Completed"
                : "Incomplete";

            currProgress =
              resChData.secondWeighInImageProofLink != "Waiting"
                ? "secondQuiz"
                : "Complete";

            currQuiz = currProgress;

            console.log("CHALLENGER DATA");
            console.log(resChData);

            // stateUpload = 'Valid'
            // currQuiz = resChData.currentInProgressQuiz

            // currProgress =
            // currProgress == "Complete" ? "secondQuiz" : currProgress;

            return res.status(200).send({
              status: "Success",
              currentQuiz: currProgress,
              statusUpload: stateUpload,
            });
            // }
          } else {
            stateUpload = "Invalid Date";
          }

          console.log("GG");
        }
      }
    }

    return res.status(200).send({
      status: "Success",
      currentQuiz: currQuiz,
      statusUpload: stateUpload,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Show Leaderboard Data By User Batch
app.get("/api/v1/uchat/getLeaderBoardByBatchID/:userID", async (req, res) => {
  // Get Wellness Video for current day BY Batch ID
  try {
    const reqDoc = db.collection("challengerDetails").doc(req.params.userID);
    // GET BATCH DATA BY USER ID
    let challengerData = await reqDoc.get();
    let challengerRes = challengerData.data();

    // console.log(challengerRes)
    if (challengerRes === null || challengerRes === undefined) {
      response = "Cannot find challenger.";
    } else {
      console.log("CHALLENGER BATCH ID: ");
      let batcHID = challengerRes.groupId;
      console.log(batcHID);

      const reqDocBatch = db.collection("batches").doc(batcHID);

      let requestedBatchID = batcHID;

      let batchData = await reqDocBatch.get();
      let batchDataRes = batchData.data();

      let startDateData = batchDataRes.batchStartDate;
      // console.log(challengerRes)
      if (batchDataRes === null || batchDataRes === undefined) {
        let response = "Cannot find marathon batch.";
        console.log("Cannot find Marathon batch...");
      } else {
        // console.log(challengerRes)
        console.log("Found Marathon Batch...");
        let registeredChallengers = await fetchAllChallengerData();
        console.log("Number of Challengers: " + registeredChallengers.length);

        console.log("BATCH START DATE: " + startDateData);
        var startDate = new Date(startDateData);

        var daysDiff = moment().diff(startDate, "days");
        console.log("CAL DIFF DATE: " + daysDiff);
        daysDiff = parseInt(daysDiff) + 2;
        console.log("DIFF DATEL: " + daysDiff);

        let daysLeaderBoard = [7, 15];

        if (daysLeaderBoard.includes(daysDiff)) {
          let rankDataCh = [];
          let forLengthMatchedChar = [];
          for (let i = 0; i < registeredChallengers.length; i++) {
            let chGroupID = registeredChallengers[i].groupId;
            if (chGroupID === requestedBatchID) {
              forLengthMatchedChar.push(chGroupID);
            }
          }
          console.log(
            "Registered Challengers Length: " + registeredChallengers.length
          );
          registeredChallengers.map((challenger) => {
            // console.log(challenger)
            let chGroupID = challenger.groupId;
            // console.log(`RequestBatch: ${requestedBatchID} === ${chGroupID} :ChBatchID`)
            if (chGroupID === requestedBatchID) {
              console.log("MATCH CH BATCH ID");
              let chName = `${challenger.firstName} ${challenger.lastName}`;
              let chGroupRank = challenger.groupRank;
              let chCurrentPoints = challenger.groupPoints;

              // console.log(rankChPosB)

              // rankChPosA === 0 ? forLengthMatchedChar.length : rankChPosA

              let returnObject = {
                challengerName: chName,
                challengerRank:
                  parseInt(chGroupRank) === 0
                    ? forLengthMatchedChar.length
                    : parseInt(chGroupRank),
                challengerPoints: parseInt(chCurrentPoints),
              };

              rankDataCh.push(returnObject);
            }

            return "";
          });

          // SORT BY POINTS
          var sortedTempRanking = rankDataCh.sort(function (a, b) {
            let rankChPosA = a.challengerRank;
            let rankChPosB = b.challengerRank;

            return rankChPosA - rankChPosB;
          });

          let rankString = "";

          // STRING BUILDER
          sortedTempRanking.map((chData) => {
            rankString += `${ordinal_suffix_of(chData.challengerRank)} ${
              chData.challengerName
            } - ${chData.challengerPoints} pts. \n`;
          });

          console.log(rankString);

          return res.status(200).send({
            status: "Success",
            rankDisplayText: rankString,
            rankData: sortedTempRanking,
          });
        } else {
          console.log("NOT LEADERBOARD DATE");
          return res.status(200).send({
            status: "Success",
            rankDisplayText: "Invalid Date",
            rankData: "Invalid Date",
          });
        }
      }
    }
    return res.status(200).send({
      status: "Success",
      currentQuiz: "ERR",
      statusUpload: "ERR",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Show Leaderboard Data By Batch
app.get("/api/v1/getLeaderBoardByBatch/:batchID", async (req, res) => {
  // Get Wellness Video for current day BY Batch ID
  try {
    const reqDocBatch = db.collection("batches").doc(req.params.batchID);

    let requestedBatchID = req.params.batchID;

    let batchData = await reqDocBatch.get();
    let batchDataRes = batchData.data();

    let startDateData = batchDataRes.batchStartDate;
    // console.log(challengerRes)
    if (batchDataRes === null || batchDataRes === undefined) {
      let response = "Cannot find marathon batch.";
      console.log("Cannot find Marathon batch...");
    } else {
      // console.log(challengerRes)
      console.log("Found Marathon Batch...");
      let registeredChallengers = await fetchAllChallengerData();
      console.log("Number of Challengers: " + registeredChallengers.length);

      let rankDataCh = [];
      let forLengthMatchedChar = [];
      for (let i = 0; i < registeredChallengers.length; i++) {
        let chGroupID = registeredChallengers[i].groupId;
        if (chGroupID === requestedBatchID) {
          forLengthMatchedChar.push(chGroupID);
        }
      }
      console.log(
        "Registered Challengers Length: " + registeredChallengers.length
      );
      registeredChallengers.map((challenger) => {
        // console.log(challenger)
        let chGroupID = challenger.groupId;
        // console.log(`RequestBatch: ${requestedBatchID} === ${chGroupID} :ChBatchID`)
        if (chGroupID === requestedBatchID) {
          console.log("MATCH CH BATCH ID");
          let chName = `${challenger.firstName} ${challenger.lastName}`;
          let chGroupRank = challenger.groupRank;
          let chCurrentPoints = challenger.groupPoints;
          let chProfileImage = challenger.selfieLink;

          // console.log(rankChPosB)

          // rankChPosA === 0 ? forLengthMatchedChar.length : rankChPosA

          let returnObject = {
            challengerName: chName,
            challengerRank:
              parseInt(chGroupRank) === 0
                ? forLengthMatchedChar.length
                : parseInt(chGroupRank),
            challengerPoints: parseInt(chCurrentPoints),
            challengerSelfie: chProfileImage,
          };

          rankDataCh.push(returnObject);
        }

        return "";
      });

      // SORT BY POINTS
      var sortedTempRanking = rankDataCh.sort(function (a, b) {
        let rankChPosA = a.challengerRank;
        let rankChPosB = b.challengerRank;

        return rankChPosA - rankChPosB;
      });

      let rankString = "";

      // STRING BUILDER
      sortedTempRanking.map((chData) => {
        rankString += `${ordinal_suffix_of(chData.challengerRank)} ${
          chData.challengerName
        } - ${chData.challengerPoints} pts. \n`;
      });

      console.log(rankString);

      return res.status(200).send({
        status: "Success",
        rankDisplayText: rankString,
        rankData: sortedTempRanking,
        batchID: batchDataRes.id,
        batchName: batchDataRes.batchName,
      });
    }

    return res.status(200).send({
      status: "Success",
      currentQuiz: "ERR",
      statusUpload: "ERR",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Show Leaderboard Data for all batches
app.get("/api/v1/getLeaderBoard", async (req, res) => {
  try {
    // GET ALL BATCHES FIRST
    const reqDoc = db.collection("batches");

    let batchRes = [];
    let rankDataJson = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;

      docs.map((doc) => {
        const selectedItem = {
          id: doc.data().id,
          batchName: doc.data().batchName,
          batchChallengeType: doc.data().batchChallengeType,
          batchStatusState: doc.data().batchStatusState,
          batchCreatedDate: doc.data().batchCreatedDate,
          batchCreator: doc.data().batchCreator,
          batchImageLink: doc.data().batchImageLink,
          batchStartDate: doc.data().batchStartDate,
          batchEndDate: doc.data().batchEndDate,
          batchStartRunTime: doc.data().batchStartRunTime,
          batchAssignedCoach: doc.data().batchAssignedCoach,
          batchAssignedBatchVid: doc.data().batchAssignedBatchVid,
          batchAssignedQuiz: doc.data().batchAssignedQuiz,
          batchAssignedQuizB: doc.data().batchAssignedQuizB,
          batchTotalChallengers: doc.data().batchTotalChallengers,
          batchChallengers: doc.data().batchChallengers,
        };

        batchRes.push(selectedItem);
      });
      return batchRes;
    });

    if (batchRes === null || batchRes === undefined) {
      console.log("No Batch Data Found");
      batchRes = [];
    } else {
      console.log("Batch Data Found: " + batchRes.length);
      let registeredChallengers = await fetchAllChallengerData();

      let rankStringData = "";

      for (let b = 0; b < batchRes.length; b++) {
        let batch = batchRes[b];

        let forLengthMatchedChar = [];
        for (let i = 0; i < registeredChallengers.length; i++) {
          let chGroupID = registeredChallengers[i].groupId;
          if (chGroupID === batch.id) {
            forLengthMatchedChar.push(chGroupID);
          }
        }

        let rankDataCh = [];

        registeredChallengers.map((challenger) => {
          // console.log(challenger)
          let chGroupID = challenger.groupId;
          // console.log(`RequestBatch: ${requestedBatchID} === ${chGroupID} :ChBatchID`)
          if (chGroupID === batch.id) {
            // console.log('MATCH CH BATCH ID')
            let chName = `${challenger.firstName} ${challenger.lastName}`;
            let chGroupRank = challenger.groupRank;
            let chCurrentPoints = challenger.groupPoints;
            let chProfileImage = challenger.selfieLink;

            // console.log(rankChPosB)

            // rankChPosA === 0 ? forLengthMatchedChar.length : rankChPosA

            let returnObject = {
              challengerName: chName,
              challengerRank:
                parseInt(chGroupRank) === 0
                  ? forLengthMatchedChar.length
                  : parseInt(chGroupRank),
              challengerPoints: parseInt(chCurrentPoints),
              challengerSelfie: chProfileImage,
            };

            rankDataCh.push(returnObject);

            // SORT BY POINTS
            var sortedTempRanking = rankDataCh.sort(function (a, b) {
              let rankChPosA = a.challengerRank;
              let rankChPosB = b.challengerRank;

              return rankChPosA - rankChPosB;
            });

            let rankString = "";

            // STRING BUILDER
            // sortedTempRanking.map(chData => {
            //   rankString += `${ordinal_suffix_of(chData.challengerRank)} ${chData.challengerName} - ${chData.challengerPoints} pts. \n`
            // })

            // console.log(rankString)
          }
        });
        console.log(rankDataCh.length);
        if (rankDataCh.length > 0) {
          let fixedJsonBatch = {
            rankData: rankDataCh,
            batchID: batch.id,
            batchName: batch.batchName,
          };
          rankDataJson.push(fixedJsonBatch);
        }
      }
    }

    return res.status(200).send({
      status: "Success",
      allLeaderboard: rankDataJson,
      rankData: "ERR",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Get getMarathonJourneyStat
app.get("/api/v1/getMarathonJourneyStat", async (req, res) => {
  try {
    let registeredChallengers = await fetchAllChallengerData();
    let totalRegisteredChallengeres = [];
    let totalPendingChallengers = [];

    registeredChallengers.map((challenger) => {
      if (challenger.groupId != "Waiting") {
        totalRegisteredChallengeres.push(challenger);
      } else {
        totalPendingChallengers.push(challenger);
      }
    });

    const reqDoc = db.collection("batches");

    let batchRes = [];

    await reqDoc.get().then((data) => {
      let docs = data.docs;
      docs.map((doc) => {
        const selectedItem = {
          id: doc.data().id,
          batchName: doc.data().batchName,
          batchChallengeType: doc.data().batchChallengeType,
          batchStatusState: doc.data().batchStatusState,
          batchCreatedDate: doc.data().batchCreatedDate,
          batchCreator: doc.data().batchCreator,
          batchImageLink: doc.data().batchImageLink,
          batchStartDate: doc.data().batchStartDate,
          batchEndDate: doc.data().batchEndDate,
          batchStartRunTime: doc.data().batchStartRunTime,
          batchAssignedCoach: doc.data().batchAssignedCoach,
          batchAssignedBatchVid: doc.data().batchAssignedBatchVid,
          batchAssignedQuiz: doc.data().batchAssignedQuiz,
          batchAssignedQuizB: doc.data().batchAssignedQuizB,
          batchTotalChallengers: doc.data().batchTotalChallengers,
          batchChallengers: doc.data().batchChallengers,
        };

        batchRes.push(selectedItem);
      });
    });

    return res.status(200).send({
      status: "Success",
      registeredChallengers: totalRegisteredChallengeres,
      pendingChallengers: totalPendingChallengers,
      batches: batchRes,
      numberOfRegisteredChallengers: totalRegisteredChallengeres.length,
      numberOfPendingChallengers: totalPendingChallengers.length,
      numberOfBatches: batchRes.length,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "Failed",
      msg: err,
    });
  }
});

// Function to convert number to suffixed term
function ordinal_suffix_of(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

// Function to get all challengers
async function fetchAllChallengerData() {
  const reqDoc = db.collection("challengerDetails");

  let response = [];

  return await reqDoc.get().then((data) => {
    let docs = data.docs;

    docs.map((doc) => {
      const selectedItem = {
        id: doc.data().id,
        uChatUserId: doc.data().uChatUserId,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        emailAddress: doc.data().emailAddress,
        age: doc.data().age,
        sex: doc.data().sex,

        currentQuizNum: doc.data().currentQuizNum,
        currentInProgressQuiz: doc.data().currentInProgressQuiz,

        height: doc.data().height,
        weightInfo: doc.data().weightInfo,
        originalWeight: doc.data().originalWeight,
        latestWeight: doc.data().latestWeight,
        lastWeightUpdateDate: doc.data().lastWeightUpdateDate,
        weightDifference: doc.data().weightDifference,
        groupId: doc.data().groupId,
        challengeTypeId: doc.data().challengeTypeId,
        coachId: doc.data().coachId,
        dateStarted: doc.data().dateStarted,
        groupRank: doc.data().groupRank,
        groupPoints: doc.data().groupPoints,
        userVerified: doc.data().userVerified,
        proofOfBillingLink: doc.data().proofOfBillingLink,
        userCode: doc.data().userCode,
        selfieLink: doc.data().selfieLink,
        weightProofLink: doc.data().weightProofLink,
        firstWeighIn: doc.data().firstWeighIn,
        firstWeighInImageProofLink: doc.data().firstWeighInImageProofLink,
        secondWeighIn: doc.data().secondWeighIn,
        secondWeighInImageProofLink: doc.data().secondWeighIn,
        firstQuizScore: doc.data().firstQuizScore,
        secondQuizScore: doc.data().secondQuizScore,
        weighInWeightProof: doc.data().weighInWeightProof,
        beforeBodyPicture: doc.data().beforeBodyPicture,
        afterBodyPicture: doc.data().afterBodyPicture,
      };

      response.push(selectedItem);
    });
    return response;
  });
}

// exports the api to firebase cloud functions
exports.app = functions.https.onRequest(app);
