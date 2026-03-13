import { BaseDAO } from "./base.dao.js";
import { Student } from "../models/student.model.js";

export class StudentMongoDAO extends BaseDAO {
    constructor() { super(Student); }
}