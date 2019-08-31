import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const { page = 1, date } = req.query;
    const where = {};

    if (date) {
      const searchDate = parseISO(date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [{ model: User }],
      limit: 10,
      offset: (page - 1) * 10,
    });
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Date in past
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    const user_id = req.userId;
    const meetup = await Meetup.create({ ...req.body, user_id });
    return res.json(meetup);
  }

  async update(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    // Verify logged user is owner
    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not permited' });
    }

    // Verify meetup already occours
    if (meetup.past) {
      return res.status(400).json({ error: 'Cant update old meetup' });
    }

    // Verify meetup date is past
    if (isBefore(req.body.date, new Date())) {
      return res.status(400).json({ error: 'Date not permited' });
    }

    await meetup.update(req.body);
    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    // Verify if logged user is the organizer
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Not permited' });
    }

    // Verify meetup date is past
    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'You cant delete past meetups' });
    }

    await meetup.destroy();
    return res.send();
  }
}
export default new MeetupController();
