import { iResponceRoom, iResponceUser } from "../entity/room/interface";

export interface iSiteInfo {
    rooms: iResponceRoom[]
    users: iResponceUser[]
}