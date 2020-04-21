import { Router } from "express"
import TrainingsCtrl from "./trainings.controller"

const router = new Router()

router.route("/add").get(TrainingsCtrl.apiGetAddTraining)
router.route("/add").post(TrainingsCtrl.apiAddTraining)
router.route("/list").get(TrainingsCtrl.apiGetTrainings)
router.route("/register/:id").post(TrainingsCtrl.apiRegisterTraining)
router.route("/edit/:id").get(TrainingsCtrl.apiGetEditTraining)
router.route("/update/:id").post(TrainingsCtrl.apiUpdateTrainingById)
router.route("/delete/:id").post(TrainingsCtrl.apiDeleteTrainingById)

export default router