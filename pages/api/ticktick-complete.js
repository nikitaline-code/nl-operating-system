import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const body = req.body || {}

    const externalId =
      body.id ||
      body.task_id ||
      body.ticktick_id

    if (!externalId) {
      return res.status(400).json({
        error: 'Missing task ID',
      })
    }

    const { data, error } = await supabase
      .from('Task List')
      .update({
        completed: true,
      })
      .eq('external_id', externalId)
      .select()

    if (error) throw error

    return res.status(200).json({
      success: true,
      updated: data,
    })
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}
