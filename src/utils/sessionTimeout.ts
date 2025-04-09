
import { supabase } from "@/integrations/supabase/client";

// Default timeout is 30 minutes of inactivity
const DEFAULT_TIMEOUT = 30 * 60 * 1000;
let timeoutId: number | null = null;
let lastActivity = Date.now();

export function initSessionTimeout(timeoutDuration = DEFAULT_TIMEOUT) {
  window.addEventListener('mousemove', updateActivity);
  window.addEventListener('keypress', updateActivity);
  window.addEventListener('click', updateActivity);
  window.addEventListener('scroll', updateActivity);
  
  startTimer(timeoutDuration);
  
  return () => {
    // Cleanup function
    window.removeEventListener('mousemove', updateActivity);
    window.removeEventListener('keypress', updateActivity);
    window.removeEventListener('click', updateActivity);
    window.removeEventListener('scroll', updateActivity);
    
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };
}

function updateActivity() {
  lastActivity = Date.now();
}

function startTimer(timeoutDuration: number) {
  if (timeoutId) {
    window.clearTimeout(timeoutId);
  }
  
  timeoutId = window.setTimeout(async () => {
    const inactivityDuration = Date.now() - lastActivity;
    
    if (inactivityDuration >= timeoutDuration) {
      console.log("Session timeout due to inactivity");
      
      // Log out the user
      await supabase.auth.signOut();
      
      // Reload the page to reset the app state
      window.location.reload();
    } else {
      // If user was active during the timeout period, restart the timer
      startTimer(timeoutDuration);
    }
  }, timeoutDuration);
}
