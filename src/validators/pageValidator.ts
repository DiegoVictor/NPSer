import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().min(1),
  }),
});
