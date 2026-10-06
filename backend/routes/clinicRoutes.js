const router = require("express").Router();

const {

 createClinic,
 getClinics,
 deleteClinic,
 updateClinic

} = require(
 "../controllers/clinicController"
);


router.post("/",createClinic);

router.get("/",getClinics);

router.delete("/:id",deleteClinic);

router.put("/:id",updateClinic);


module.exports = router;