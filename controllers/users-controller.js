const { validationResult } = require('express-validator');
const bcryptjs = require("bcryptjs");
const HttpError = require('../models/http-error');
const User = require('../models/user');
const Doctor = require('../models/doctor');
const Radiologist = require('../models/radiologist');
const Patient = require('../models/patient');
const Feedback = require('../models/feedback');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const getDoctors = async (req, res, next) => {
  let doctors;
  try {
    doctors = await Doctor.find({});
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Fetching doctors failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ doctors: doctors.map(doctor => doctor.toObject({ getters: true })) });
};

const getPatients = async (req, res, next) => {
  let patients;
  try {
    patients = await Patient.find({});
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Fetching patients failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ patients: patients.map(patient => patient.toObject({ getters: true })) });
};

const getRadiologists = async (req, res, next) => {
  let radiologists;
  try {
    radiologists = await Radiologist.find({});
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Fetching radiologists failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ radiologists: radiologists.map(radiologist => radiologist.toObject({ getters: true })) });
};

const emailVerification = async (req, res) => {
  try {
    const { email} = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
        console.log(false);
        return res.json(false);
    }
    else{
        console.log(true);
        return res.json(user);
    }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const passwordReset = async (req, res) => {
  try {
    const { email, password, confirmPassword} = req.body;
    if (password != confirmPassword) {
        return res.status(400).json({ msg: "Please match the password!" });
    }
    const user = await User.findOne({ email });
    const hashedPassword = await bcryptjs.hash(password, 8);
    user.password = password;
    await user.save();
    res.status(200).json({ msg: "Password updated successfully!" });
    
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password, role } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    role,
    password,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Loggin in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  res.json({
    message: 'Logged in!',
    user: existingUser.toObject({ getters: true })
  });
};

const addDoctor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { userId, contact,userName, gender, experience, time, fees, image, specialization, description } = req.body;

  const createdDoctor = new Doctor({
    contact,
    gender,
    userName,
    image,
    specialization,
    description,
    experience,
    fees,
    time,
    userId,
  });
  console.log(createdDoctor);

  try {
    await createdDoctor.save();
  } catch (err) {
    const error = new HttpError(
      'Creating doctor failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ doctor: createdDoctor.toObject({ getters: true }) });
};

const addRadiologist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { userId, age, contact, gender, image } = req.body;

  const createdRadiologist = new Radiologist({
    userId,
    age,
    image,
    gender,
    contact,
  });
  console.log(createdRadiologist);

  try {
    await createdRadiologist.save();
  } catch (err) {
    const error = new HttpError(
      'Creating radiologist failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ radiologist: createdRadiologist.toObject({ getters: true }) });
};

const addPatient = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { userId,userName, age, contact, gender, image } = req.body;

  const createdPatient = new Patient({
    userId,
    userName,
    age,
    contact,
    gender,
    image
  });
  console.log(createdPatient);

  try {
    await createdPatient.save();
  } catch (err) {
    const error = new HttpError(
      'Creating patient failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ patient: createdPatient.toObject({ getters: true }) });
};

const updatePatient = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return next(
          new HttpError('Invalid inputs passed, please check your data.', 422)
      );
  }

  const { userId, email, userName, contact, age, image, gender } = req.body;
  let patient;
  try {
      patient = await Patient.findOne({userId});
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not find patient.',
          500
      );
      return next(error);
  }
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not find user.',
          500
      );
      return next(error);
  }

  patient.userName = userName;
  patient.contact = contact;
  patient.age = age;
  patient.gender = gender;
  patient.image = image;
  user.name = userName;
  user.email = email;

  console.log(patient);
  console.log(user);

  try {
      await patient.save();
      await user.save();
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not update patient.',
          500
      );
      return next(error);
  }

  res.status(200).json({ patient: patient.toObject({ getters: true }), user: user.toObject({getters:true}) });
};

const updateDoctor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return next(
          new HttpError('Invalid inputs passed, please check your data.', 422)
      );
  }

  const { userId, email, name, contact, experience, specialization,description,time, fees, image , gender } = req.body;
  let doctor;
  try {
    doctor = await Doctor.findOne({userId});
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not find doctor.',
          500
      );
      return next(error);
  }
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not find user.',
          500
      );
      return next(error);
  }

  doctor.userName = name;
  doctor.contact = contact;
  doctor.experience = experience;
  doctor.gender = gender;
  doctor.image = image;
  doctor.specialization = specialization;
  doctor.fees = fees;
  doctor.time = time;
  doctor.description = description;
  user.name = name;
  user.email = email;

  console.log(doctor);
  console.log(user);

  try {
      await doctor.save();
      await user.save();
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not update doctor.',
          500
      );
      return next(error);
  }

  res.status(200).json({ doctor: doctor.toObject({ getters: true }), user: user.toObject({getters:true}) });
};

const updateRadiologist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return next(
          new HttpError('Invalid inputs passed, please check your data.', 422)
      );
  }

  const { userId, email, userName, contact, age, image, gender } = req.body;
  let radiologist;
  try {
    radiologist = await Radiologist.findOne({userId});
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not find radiologist.',
          500
      );
      return next(error);
  }
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not find user.',
          500
      );
      return next(error);
  }

  radiologist.userName = userName;
  radiologist.contact = contact;
  radiologist.age = age;
  radiologist.gender = gender;
  radiologist.image = image;
  user.name = userName;
  user.email = email;

  console.log(radiologist);
  console.log(user);

  try {
      await radiologist.save();
      await user.save();
  } catch (err) {
      const error = new HttpError(
          'Something went wrong, could not update radiologist.',
          500
      );
      return next(error);
  }

  res.status(200).json({ radiologist: radiologist.toObject({ getters: true }), user: user.toObject({getters:true}) });
};


const addFeedback = async (req, res, next) => {
    const {userId, feedback, rating} = req.body;

    console.log(feedback);
    try {
        if (!feedback || !rating) {
            return res.status(400).json({ msg: "Please fill the field and stars!" });
        }

        const newFeedback = new Feedback({
            userId,
            feedback,
            rating
        });
        console.log(newFeedback);
        await newFeedback.save();

        res.status(200).json({ msg: "Feedback recieved, Thank you!" });
    } catch (error) {
          console.error(error);
          return res.status(500).json({ msg: "Internal server error. Please try later." });
      }
};



exports.getUsers = getUsers;
exports.getDoctors = getDoctors;
exports.getPatients = getPatients;
exports.getRadiologists = getRadiologists;
exports.emailVerification = emailVerification;
exports.passwordReset = passwordReset;
exports.signup = signup;
exports.login = login;
exports.addDoctor = addDoctor;
exports.addPatient = addPatient;
exports.addRadiologist = addRadiologist;
exports.updatePatient = updatePatient;
exports.updateDoctor = updateDoctor;
exports.updateRadiologist = updateRadiologist;
exports.addFeedback = addFeedback;