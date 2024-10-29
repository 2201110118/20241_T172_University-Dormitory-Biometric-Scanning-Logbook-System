import account from '../models/account.js'

const getAccounts = async (req, res) => {
  try {
    const account = await account.find();
    res.send(account);
  } catch (error) {
    console.log(error)
  }
}

const getAccount = async (req, res) => {
  try {
    const account = await account.findById(req.params.id)
    res.send(account);
  } catch (error) {
    console.log(error)
  }
}

const postAccount = async (req, res) => {
  try {
    const account = new Account(req.body);
    const savedAccount = await account.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    console.log(error);
  }
};

// const updateAccount= async (req, res) => {
//   try {

//     const updates = Object.fromEntries(
//       Object.entries(req.body).filter(([_, value]) => value !== "")
//     );

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({ message: "No valid fields to update." });
//     }

//     const updatedAccount = await account.findByIdAndUpdate(req.params.id, updates)
//     console.log(updatedAccount)
//     res.status(200).json(updatedAccount);
//   } catch (error) {
//     console.log(error)
//   }
// }

// const deleteAccount = async (req, res) => {
//   try {
//     const account = await Student.findByIdAndDelete(req.params.id)
//     res.status(200).json(`Account has been deleted`)
//   } catch (error) {
//     console.log(error)
//   }
// }
export { getAccounts, getAccount, postAccount }; // updateAccount, deleteAccount