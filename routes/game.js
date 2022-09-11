const router = require("express").Router();
require('dotenv').config("../env")
const bs58 = require('bs58');
const {Keypair,  SystemProgram, LAMPORTS_PER_SOL, Transaction, clusterApiUrl, sendAndConfirmTransaction, Connection} = require("@solana/web3.js");
const solanaWeb3 = require('@solana/web3.js');
const path = require('path');

const keyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.SECRET)
  );
const minSolAmmount = 5

let balanceInc = 0.00
const asyncheckTx = async(req, res, next) =>{

    const sign = req.body.sign
    if(!sign){
      res.json(500)
    }
   
    let connection = new Connection(clusterApiUrl('mainnet-beta'));
    //const tx =  connection.GetVersionedTransactionConfig(connection, )
    
    
    
    try{
      const sigStatus = await connection.getSignatureStatus(sign)
      const a = await connection.getParsedTransaction(sign)
   
      const b = await connection.getConfirmedSignaturesForAddress2(new solanaWeb3.PublicKey(req.body.pub), null, "confirmed")
      const txToCheck = b[0]
      if(txToCheck.signature==sign & sigStatus.value.confirmationStatus=="confirmed" & a==null){
        next()
        
      }
    }catch(err){
      req.body.st= 500
      console.log("err")
      next()
    }
    
  }
  
  
  
router.post("/game",asyncheckTx, async(req, res) => {
   
    if(req.body.st==500){
      return res.status(500).json("Bad Request")
    }
    let bid = parseFloat(req.body.bid)
    
    if(typeof bid !== "number"){
      return res.status(500).json("Incorrect bid")
    }
      // calc chances 
    function getRandomIntInclusive() {
        const min = Math.ceil(0);
        const max = Math.floor(100);
        return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
      } 
  
    const chance = getRandomIntInclusive()
    let game = 1
    
    //set game buy chance 
    // if 1 <= x <= 25: # 25% на 0х
    //       s += stavka
    //   if 26 <= x <= 45: # 20% на 0.5х
    //       s += 0.5 * stavka
    //   if 46 <= x <= 60: # 15% на 0.75х
    //       s += 0.25 * stavka
    //   if 61 <= x <= 70: # 10% на 1х
    //       s += 0 * stavka
    //   if 71 <= x <= 80: # 10% на 1.25х
    //       s -= 0.25 * stavka
    //   if 81 <= x <= 90: # 10% на 1.5х
    //       s -= 0.5 * stavka
    //   if 91 <= x <= 98: # 8% на 2х
    //       s -= 1 * stavka
    //   if 99 <= x <= 100: # 2% на 5х
    //       s -= 4 * stavka
      
    if(chance<=25){
      game = 0
      return res.json({game: game, isWin: false, ammount: 0})
    }
    const isWin = true
    if(chance>=26 & chance<=45){
      game = 1
      bid*=0.5
    }
    if(chance>=46 & chance<=60){
      game = 2
      bid*=0.75
    }
    if(chance>=61 & chance<=70){
      game = 3
    }
    if(chance>=71 & chance<=80){
      game = 4
      bid*=1.25
    }
    if(chance>=81 & chance<=90){
      game = 5
      bid*=1.5
    }
    if(chance>=91 & chance<=98){
      game = 6
      bid*=2
    }
    if(chance>=99 & chance<=100){
      game = 7
      bid*=5
    }
  
    
    
  
  
    const publicKey = req.body.pub
    let transaction = new Transaction();
    
    let connection = new Connection(clusterApiUrl('mainnet-beta'));
    
    let casinoBalanceSol = await connection.getBalance(keyPair.publicKey)/LAMPORTS_PER_SOL
  
    
    if(casinoBalanceSol-minSolAmmount-bid<0){
      return res.json({game: 0, isWin: false, ammount: 0})
    }
  
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keyPair.publicKey,
        toPubkey: publicKey,
        lamports: Math.trunc(bid*LAMPORTS_PER_SOL)
      })
    )
    sendAndConfirmTransaction(
      connection,
      transaction,
      [keyPair]
    );
    
  
    res.json({game: game, isWin: isWin, ammount: bid.toFixed(2)})
  });
module.exports = router;