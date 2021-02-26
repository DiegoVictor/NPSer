import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    value: Joi.number().required(),
  }),
  [Segments.QUERY]: Joi.object().keys({
    id: Joi.string().required(),
  }),
});
