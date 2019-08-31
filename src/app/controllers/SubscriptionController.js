import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Mail from '../../lib/Mail';

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
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.id, { include: [User] });

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
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      template: 'subscription',
      context: {
        user,
        meetup,
      },
      subject: `Nova inscrição | ${meetup.title}`,
      text: `Dados do inscrito: ${user.name} - ${user.email}`,
    });
    return res.json(subscribe);
  }
}

export default new SubscriptionController();
