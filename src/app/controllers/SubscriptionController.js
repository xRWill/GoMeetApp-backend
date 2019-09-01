import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          where: { date: { [Op.gt]: new Date() } },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'email'],
    });
    const meetup = await Meetup.findByPk(req.params.id, {
      attributes: ['id', 'user_id', 'title', 'date', 'past'],
      include: [{ model: User, attributes: ['name', 'email'] }],
    });

    // Logged user organizes meetup
    if (meetup.user_id === user.id) {
      return res
        .status(400)
        .json({ error: 'You cant subscribe to your meetup' });
    }

    // Date in past
    if (meetup.past) {
      return res.status(400).json({ error: 'Meetup already occoured' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscribe = await Subscription.create({
      meetup_id: meetup.id,
      user_id: user.id,
    });
    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });
    return res.json(subscribe);
  }
}

export default new SubscriptionController();
