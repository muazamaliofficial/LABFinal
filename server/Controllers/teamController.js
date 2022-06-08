const teamSchema = require("../Model/teamSchema");
const HttpError = require("../Model/HttpError");

//create new team
const createTeam = async (req, res, next) => {
    const { userId } = req.body;

    const newTeam = new teamSchema({
        createdBy: userId
    });

    try {
        await newTeam.save();
    } catch (err) {
        const error = new HttpError("Team Creation Failed", 500);
        //console.log(err);
        return next(error);
    }

    res.status(201).json({ message: "Team Creation Success" });
};

//view team by team id
const viewTeamById = async (req, res, next) => {
    let team;

    try {
        team = await teamSchema.findById(req.params.id);
    } catch (err) {
        const error = new HttpError("Could not find a Team", 500);
        return next(error);
    }

    if (!team) {
        return next(new HttpError("No Team Found", 404));
    }
    res.status(201).json({ data: team });
}

//view all teams
const viewAllTeams = async (req, res, next) => {
    let teams;

    try {
        teams = await teamSchema.find().populate('createdBy');
    } catch (err) {
        const error = new HttpError("Could not find", 500);
        return next(error);
    }

    res.status(201).json({ data: teams });
}

//view team by user id
const viewTeamByUser = async (req, res, next) => {
    let team;

    try {
        team = await teamSchema.findOne({ createdBy: req.params.id }).populate('createdBy').populate('goalkeeper').populate('midfilder').populate("defender").populate("striker1").populate("striker2");
    } catch (err) {
        const error = new HttpError("Could not find", 500);
        return next(error);
    }

    res.status(201).json({ data: team });
}

//add player to team
const updateTeam = async (req, res, next) => {

    const { player, team, category } = req.body

    try {
        if (category === 'goal') {
            await teamSchema.findByIdAndUpdate(team, {
                goalkeeper: player
            })
        } else if (category === 'def') {
            await teamSchema.findByIdAndUpdate(team, {
                defender: player
            })
        } else if (category === 'mid') {
            await teamSchema.findByIdAndUpdate(team, {
                midfilder: player
            })
        } else if (category === 'st') {
            let tm;

            try {
                tm = await teamSchema.findById(team);
            } catch (err) {
                const error = new HttpError("Could not find a Team", 500);
                return next(error);
            }

            if (!tm) {
                return next(new HttpError("No Team Found", 404));
            }

            if ((tm.striker1 != "" && tm.striker2 != "") && (player == tm.striker2)) {
                const error = new HttpError("Strikers can't be same", 500);
                return next(error);
            }

            await teamSchema.findByIdAndUpdate(team, {
                striker1: player
            })
        } else if (category === 'ker') {

            let tm;

            try {
                tm = await teamSchema.findById(team);
            } catch (err) {
                const error = new HttpError("Could not find a Team", 500);
                return next(error);
            }

            if (!tm) {
                return next(new HttpError("No Team Found", 404));
            }

            if ((tm.striker1 != "" && tm.striker2 != "") && (player == tm.striker1)) {
                const error = new HttpError("Strikers can't be same", 500);
                return next(error);
            }

            await teamSchema.findByIdAndUpdate(team, {
                striker2: player
            })
        }
    } catch (err) {
        const error = new HttpError("Update Failed", 500);
        return next(error);
    }

    res.json({ message: "Player Added" });
}

//remove player from team
const deletePlayerFromTeam = async (req, res, next) => {

    const id = req.params.id;
    const cat = req.params.cat

    try {
        if (cat === 'goal') {
            await teamSchema.findByIdAndUpdate(id,
                {
                    $unset: { goalkeeper: 1 }
                })
        } else if (cat === 'def') {
            await teamSchema.findByIdAndUpdate(id,
                {
                    $unset: { defender: 1 }
                })
        } else if (cat === 'mid') {
            await teamSchema.findByIdAndUpdate(id,
                {
                    $unset: { midfilder: 1 }
                })
        } else if (cat === 'st1') {
            await teamSchema.findByIdAndUpdate(id,
                {
                    $unset: { striker1: 1 }
                })
        } else if (cat === 'st2') {
            await teamSchema.findByIdAndUpdate(id,
                {
                    $unset: { striker2: 1 }
                })
        }
    } catch (err) {
        console.log(err)
        const error = new HttpError("Update Failed", 500);
        return next(error);
    }

    res.json({ message: "Player Removed" });
}

//export above function
exports.createTeam = createTeam;
exports.viewTeamById = viewTeamById;
exports.viewAllTeams = viewAllTeams;
exports.updateTeam = updateTeam;
exports.viewTeamByUser = viewTeamByUser;
exports.deletePlayerFromTeam = deletePlayerFromTeam;