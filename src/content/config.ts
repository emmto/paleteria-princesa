import { defineCollection, z } from 'astro:content';

const productos = defineCollection({
  type: 'data',
  schema: z.object({
    catalogo: z.array(z.object({
      id: z.string(),
      nombre: z.string(),
      categoria: z.string().optional(), // Inferred from grouping
      permiteVariado: z.boolean().default(false),
      precios: z.object({
        menudeo: z.number(),
        medio: z.number(),
        mayoreo: z.number(),
      }),
      sabores: z.array(z.string()).optional(),
      imagen: z.string().optional(),
    }))
  })
});

export const collections = {
  productos,
};
