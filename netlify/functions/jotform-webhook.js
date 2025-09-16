// netlify/functions/jotform-webhook.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'JotForm Webhook Endpoint Active (Netlify)',
        status: 'ready',
        endpoint: '/.netlify/functions/jotform-webhook'
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const formData = JSON.parse(event.body);
      
      // Process JotForm data
      const extractedData = {
        full_name: formData.q1_fullName || formData.q1_name || 'Unknown',
        email: formData.q2_email || formData.email || 'unknown@example.com',
        role: 'consultant'
      };

      // Save to Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([extractedData])
        .select()
        .single();

      if (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Consultant imported successfully',
          data: data
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
