import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, res) {
    const myMeetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });
    return res.json(myMeetups);
  }
}
export default new OrganizingController();
